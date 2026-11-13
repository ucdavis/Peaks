using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Controllers;
using Keas.Mvc.Models;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Routing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace Test.TestsController
{
    [Trait("Category", "ControllerTests")]
    public class TeamAdminKeyImportTests : IDisposable
    {
        private const string LegacyHeader = "KeyName,KeyCode,KeyNotes,KeyTags,SerialNumber,KerbUser,DateIssued,DateDue,Status,SerialNotes";
        private readonly SqliteConnection _connection;
        private readonly ApplicationDbContext _context;
        private readonly TeamAdminController _controller;
        private readonly Team _team;
        private readonly Mock<IIdentityService> _identityService = new Mock<IIdentityService>(MockBehavior.Strict);

        public TeamAdminKeyImportTests()
        {
            _connection = new SqliteConnection("Data Source=:memory:");
            _connection.Open();
            _context = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite(_connection).Options);
            _context.Database.EnsureCreated();
            _team = new Team { Name = "Test team", Slug = "test-team" };
            _context.Teams.Add(_team);
            _context.SaveChanges();

            var httpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, "test-importer"),
                    new Claim("name", "Test Importer")
                }, "Test"))
            };
            _controller = new TeamAdminController(_context,
                _identityService.Object,
                Mock.Of<IUserService>(MockBehavior.Strict),
                Mock.Of<IFinancialService>(MockBehavior.Strict),
                Mock.Of<INotificationService>(MockBehavior.Strict))
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = httpContext,
                    RouteData = new RouteData()
                },
                TempData = new TempDataDictionary(httpContext, Mock.Of<ITempDataProvider>()),
                ObjectValidator = Mock.Of<IObjectModelValidator>()
            };
            _controller.RouteData.Values["teamName"] = _team.Slug;
        }

        [Fact]
        public async Task QuotedSerialTagsPersistSeparatelyFromKeyTagsAndEachResultKeepsItsOwnValues()
        {
            var results = await Import(LegacyHeader + ",SerialTags\r\n"
                + Row("001", "Spare,Front desk") + "\r\n"
                + Row("002", "Back office"));

            Assert.Equal(2, results.Count);
            Assert.All(results, result => Assert.True(result.Success));
            Assert.Equal(new[] { "Spare,Front desk", "Back office" },
                results.Select(result => result.Import.SerialTags));
            _context.ChangeTracker.Clear();
            var serials = await _context.KeySerials.OrderBy(serial => serial.Number).ToArrayAsync();
            Assert.Equal(new[] { "Spare,Front desk,Imported", "Back office,Imported" },
                serials.Select(serial => serial.Tags));
            Assert.Equal("key-only,Imported", (await _context.Keys.SingleAsync()).Tags);
            Assert.All(serials, serial => Assert.Equal(_team.Id, serial.TeamId));
        }

        [Theory]
        [InlineData("", "Imported")]
        [InlineData("  , ", "Imported")]
        [InlineData("Imported,imported,Imported", "Imported")]
        [InlineData(" Spare, ,Front desk,Imported,imported,Spare ", "Spare,Front desk,Imported")]
        public async Task NewSerialsNormalizeTagsAndReceiveImportedExactlyOnce(string tags, string expected)
        {
            var result = Assert.Single(await Import(LegacyHeader + ",SerialTags\r\n" + Row("001", tags)));

            Assert.True(result.Success);
            _context.ChangeTracker.Clear();
            Assert.Equal(expected, (await _context.KeySerials.SingleAsync()).Tags);
        }

        [Fact]
        public async Task LegacyCsvWithoutSerialTagsStillImportsAndAddsImported()
        {
            var result = Assert.Single(await Import(LegacyHeader + "\r\n" + Row("001")));

            Assert.True(result.Success);
            Assert.Null(result.Import.SerialTags);
            _context.ChangeTracker.Clear();
            Assert.Equal("Imported", (await _context.KeySerials.SingleAsync()).Tags);
        }

        [Fact]
        public async Task ExistingSerialTagsArePreservedAndReportedAsUnchanged()
        {
            var key = new Key { Name = "Existing key", Code = "TEST", Team = _team, Tags = "existing-key" };
            _context.KeySerials.Add(new KeySerial
            {
                Key = key,
                Team = _team,
                Number = "001",
                Name = "001",
                Tags = "existing-serial"
            });
            await _context.SaveChangesAsync();

            var result = Assert.Single(await Import(LegacyHeader + ",SerialTags\r\n" + Row("001", "replacement")));

            Assert.True(result.Success);
            Assert.Contains("Serial tags not changed.", result.Messages);
            Assert.Equal("replacement", result.Import.SerialTags);
            _context.ChangeTracker.Clear();
            Assert.Equal("existing-serial", (await _context.KeySerials.SingleAsync()).Tags);
            Assert.Equal("existing-key", (await _context.Keys.SingleAsync()).Tags);
        }

        [Fact]
        public async Task InvalidSerialRollsBackTheRowIncludingItsTagsAndNewKey()
        {
            var result = Assert.Single(await Import(LegacyHeader + ",SerialTags\r\n"
                + Row(new string('1', 65), "Spare")));

            Assert.False(result.Success);
            Assert.Contains(result.ErrorMessage, error => error.Contains("max 64 characters"));
            Assert.Equal("Spare", result.Import.SerialTags);
            _context.ChangeTracker.Clear();
            Assert.Empty(await _context.KeySerials.ToListAsync());
            Assert.Empty(await _context.Keys.ToListAsync());
        }

        [Theory]
        [InlineData(false, false)]
        [InlineData(false, true)]
        [InlineData(true, false)]
        [InlineData(true, true)]
        public async Task MissingOrFutureIssuedDateUsesImportTime(bool existingAssignment, bool futureIssuedDate)
        {
            var person = await PrepareAssignment(existingAssignment);
            var dateIssued = futureIssuedDate
                ? DateTime.Today.AddDays(30).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)
                : "";
            var dateDue = DateTime.Today.AddDays(90);
            var beforeImport = DateTime.UtcNow;

            var result = Assert.Single(await Import(LegacyHeader + "\r\n"
                + Row("001", kerbUser: person.UserId, dateIssued: dateIssued,
                    dateDue: dateDue.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture))));
            var afterImport = DateTime.UtcNow;

            Assert.True(result.Success);
            Assert.Empty(result.ErrorMessage);
            _context.ChangeTracker.Clear();
            var assignment = await _context.KeySerialAssignments.SingleAsync();
            var serial = await _context.KeySerials.SingleAsync();
            Assert.InRange(assignment.RequestedAt, beforeImport, afterImport);
            Assert.Equal(dateDue.ToUniversalTime(), assignment.ExpiresAt);
            Assert.Equal(person.Id, assignment.PersonId);
            Assert.Equal(serial.Id, assignment.KeySerialId);
            Assert.Equal(assignment.Id, serial.KeySerialAssignmentId);
        }

        [Theory]
        [InlineData(false, 2020)]
        [InlineData(true, 2020)]
        [InlineData(false, 1900)]
        [InlineData(true, 1900)]
        public async Task PastIssuedDateIsPreservedWithTheExistingMinimum(bool existingAssignment, int issuedYear)
        {
            var person = await PrepareAssignment(existingAssignment);
            var dateIssued = new DateTime(issuedYear, 6, 15);
            var expectedIssued = issuedYear == 1900
                ? new DateTime(1970, 1, 1)
                : dateIssued.ToUniversalTime();
            var dateDue = DateTime.Today.AddDays(90);

            var result = Assert.Single(await Import(LegacyHeader + "\r\n"
                + Row("001", kerbUser: person.UserId,
                    dateIssued: dateIssued.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                    dateDue: dateDue.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture))));

            Assert.True(result.Success);
            Assert.Empty(result.ErrorMessage);
            _context.ChangeTracker.Clear();
            var assignment = await _context.KeySerialAssignments.SingleAsync();
            var serial = await _context.KeySerials.SingleAsync();
            Assert.Equal(expectedIssued, assignment.RequestedAt);
            Assert.Equal(dateDue.ToUniversalTime(), assignment.ExpiresAt);
            Assert.Equal(person.Id, assignment.PersonId);
            Assert.Equal(serial.Id, assignment.KeySerialId);
            Assert.Equal(assignment.Id, serial.KeySerialAssignmentId);
        }

        [Theory]
        [InlineData("", true)]
        [InlineData("", false)]
        [InlineData("2020-06-15", true)]
        [InlineData("2020-06-15", false)]
        [InlineData("1900-06-15", true)]
        [InlineData("1900-06-15", false)]
        public async Task InvalidDueDateLeavesExistingIssuedDateUnchanged(string dateIssued, bool missingDueDate)
        {
            var person = await PrepareAssignment(true);
            var assignment = await _context.KeySerialAssignments.SingleAsync();
            var originalRequestedAt = assignment.RequestedAt;
            var dateDue = missingDueDate
                ? ""
                : DateTime.Today.AddDays(-1).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

            var result = Assert.Single(await Import(LegacyHeader + "\r\n"
                + Row("001", kerbUser: person.UserId, dateIssued: dateIssued, dateDue: dateDue)));

            Assert.Contains("DateDue value not supplied or not in the future.", Assert.Single(result.ErrorMessage));
            Assert.Equal(originalRequestedAt, assignment.RequestedAt);
            _context.ChangeTracker.Clear();
            var persistedAssignment = await _context.KeySerialAssignments.SingleAsync();
            Assert.Equal(originalRequestedAt, persistedAssignment.RequestedAt);
        }

        private async Task<Person> PrepareAssignment(bool existingAssignment)
        {
            _context.Users.Add(new User
            {
                Id = "test-importer", FirstName = "Test", LastName = "Importer", Email = "importer@example.com"
            });
            var person = new Person
            {
                Team = _team,
                FirstName = "Test", LastName = "Assignee", Email = "assignee@example.com",
                User = new User
                {
                    Id = "test-assignee", FirstName = "Test", LastName = "Assignee", Email = "assignee@example.com"
                }
            };
            _context.People.Add(person);
            await _context.SaveChangesAsync();
            _identityService.Setup(service => service.GetOrCreatePersonFromKerberos(
                    person.UserId, _team.Id, It.IsAny<Team>(), "Test Importer", "test-importer", "CSV Import -- Keys"))
                .ReturnsAsync((person, 0));

            if (existingAssignment)
            {
                var serial = new KeySerial
                {
                    Key = new Key { Name = "Existing key", Code = "TEST", Team = _team },
                    Team = _team, Number = "001", Name = "001"
                };
                var assignment = new KeySerialAssignment
                {
                    KeySerial = serial, Person = person, RequestedById = "test-importer",
                    RequestedAt = new DateTime(2000, 1, 1), ExpiresAt = DateTime.UtcNow.AddDays(7)
                };
                _context.KeySerialAssignments.Add(assignment);
                await _context.SaveChangesAsync();
                serial.KeySerialAssignmentId = assignment.Id;
                await _context.SaveChangesAsync();
            }

            return person;
        }

        private async Task<List<KeyImportResults>> Import(string csv)
        {
            using var stream = new MemoryStream(Encoding.UTF8.GetBytes(csv));
            var file = new FormFile(stream, 0, stream.Length, "file", "keys.csv");
            var result = Assert.IsType<ViewResult>(await _controller.UploadKeys(file));
            return Assert.IsType<List<KeyImportResults>>(result.Model);
        }

        private static string Row(string serialNumber, string serialTags = null, string kerbUser = "",
            string dateIssued = "", string dateDue = "")
        {
            var fields = new List<string>
            {
                "Test key", "TEST", "", "key-only", serialNumber, kerbUser, dateIssued, dateDue, "Active", ""
            };
            if (serialTags != null)
            {
                fields.Add(serialTags);
            }
            return string.Join(",", fields.Select(value => "\"" + value.Replace("\"", "\"\"") + "\""));
        }

        public void Dispose()
        {
            _context.Dispose();
            _connection.Dispose();
        }
    }
}
