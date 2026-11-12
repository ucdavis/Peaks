using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Controllers;
using Keas.Mvc.Models;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Routing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace Test.TestsController
{
    public class PersonAdminBulkEditTests : IDisposable
    {
        private readonly SqliteConnection _connection;
        private readonly ApplicationDbContext _context;
        private readonly PersonAdminController _controller;
        private readonly Person _person;
        private readonly Person _other;
        private readonly Mock<INotificationService> _notifications = new Mock<INotificationService>(MockBehavior.Strict);

        public PersonAdminBulkEditTests()
        {
            _connection = new SqliteConnection("Data Source=:memory:");
            _connection.Open();
            _context = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite(_connection).Options);
            _context.Database.EnsureCreated();
            _person = new Person
            {
                Team = new Team { Name = "Test team", Slug = "test-team" },
                FirstName = "Sample", LastName = "Person", Email = "person@example.test",
                Category = "Staff", Tags = "Existing",
                StartDate = new DateTime(2026, 1, 1), EndDate = new DateTime(2026, 12, 31)
            };
            _other = new Person
            {
                Team = new Team { Name = "Other team", Slug = "other-team" },
                FirstName = "Other", LastName = "Person", Email = "other@example.test", Category = "Staff"
            };
            _context.People.AddRange(_person, _other);
            _context.Tags.Add(new Tag { Team = _person.Team, Name = "Existing" });
            _context.Tags.Add(new Tag { Team = _other.Team, Name = "OtherTag" });
            _context.SaveChanges();

            var httpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, "editor") }, "Test"))
            };
            _controller = new PersonAdminController(_context, _notifications.Object,
                Mock.Of<IIdentityService>(MockBehavior.Strict))
            {
                ControllerContext = new ControllerContext { HttpContext = httpContext, RouteData = new RouteData() },
                TempData = new TempDataDictionary(httpContext, Mock.Of<ITempDataProvider>())
            };
            _controller.RouteData.Values["teamName"] = "test-team";
        }

        private BulkEditModel CategoryUpdate() => new BulkEditModel
        {
            Ids = _person.Id.ToString(), UpdateCategory = true, Category = "Faculty"
        };

        private async Task Submit(BulkEditModel model)
        {
            Assert.IsType<ViewResult>(await _controller.BulkEdit(model));
        }

        private async Task AssertUnchanged(string field)
        {
            Assert.False(_controller.ModelState.IsValid);
            Assert.True(_controller.ModelState.ContainsKey(field));
            Assert.Contains("No changes were saved", _controller.ErrorMessage);
            Assert.Null(_controller.Message);
            // Verify validation did not mutate tracked entities or persist part of a batch.
            Assert.Equal("Staff", _person.Category);
            _context.ChangeTracker.Clear();
            Assert.Equal("Staff", (await _context.People.SingleAsync(p => p.Id == _person.Id)).Category);
            Assert.Equal("Staff", (await _context.People.SingleAsync(p => p.Id == _other.Id)).Category);
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData(" ")]
        [InlineData("abc")]
        [InlineData("1,")]
        [InlineData("1,,2")]
        [InlineData("0")]
        [InlineData("-1")]
        [InlineData("99999999999999999")]
        public async Task MalformedSelectionsReturnValidationInsteadOfThrowing(string ids)
        {
            var model = CategoryUpdate();
            model.Ids = ids;
            await Submit(model);
            await AssertUnchanged(string.Empty);
        }

        [Theory]
        [InlineData(false)]
        [InlineData(true)]
        public async Task RejectsAnEntireSelectionContainingAnotherTeamsPerson(bool deleting)
        {
            var model = CategoryUpdate();
            model.Ids += $",{_other.Id}";
            model.DeleteUsers = deleting;
            await Submit(model);
            await AssertUnchanged(string.Empty);
            Assert.True((await _context.People.SingleAsync(p => p.Id == _person.Id)).Active);
            Assert.True((await _context.People.SingleAsync(p => p.Id == _other.Id)).Active);
        }

        [Theory]
        [InlineData(false)]
        [InlineData(true)]
        public async Task RejectsMissingOrInactiveSelections(bool inactive)
        {
            var model = CategoryUpdate();
            if (inactive)
            {
                _person.Active = false;
                await _context.SaveChangesAsync();
            }
            else model.Ids += ",2147483647";
            await Submit(model);
            Assert.False(_controller.ModelState.IsValid);
            Assert.Equal("Staff", _person.Category);
        }

        [Fact]
        public async Task DeduplicatesIdsAndIgnoresUncheckedFieldErrorsAndValues()
        {
            var model = CategoryUpdate();
            model.Ids += $", {_person.Id}";
            model.EndDate = new DateTime(2020, 1, 1);
            foreach (var field in new[] { "StartDate", "EndDate", "SupervisorEmail", "SelectedTags" })
                _controller.ModelState.AddModelError(field, "Invalid unchecked value");
            await Submit(model);
            Assert.True(_controller.ModelState.IsValid);
            Assert.Equal("Faculty", _person.Category);
            Assert.Equal(new DateTime(2026, 12, 31), _person.EndDate);
            Assert.Equal("1 people selected. Updated: 1 Skipped: 0", _controller.Message);
        }

        [Fact]
        public async Task RequiresAtLeastOneChange()
        {
            await Submit(new BulkEditModel { Ids = _person.Id.ToString() });
            await AssertUnchanged(string.Empty);
        }

        [Theory]
        [InlineData("StartDate")]
        [InlineData("EndDate")]
        public async Task BindingErrorsInCheckedDatesPreventAllUpdates(string field)
        {
            var model = CategoryUpdate();
            model.UpdateStartDate = field == "StartDate";
            model.UpdateEndDate = field == "EndDate";
            _controller.ModelState.AddModelError(field, "Incomplete date");
            await Submit(model);
            await AssertUnchanged(field);
        }

        [Theory]
        [InlineData(true, false)]
        [InlineData(false, true)]
        [InlineData(true, true)]
        public async Task ValidatesResultingRangesIncludingUnchangedDates(bool start, bool end)
        {
            var model = CategoryUpdate();
            model.UpdateStartDate = start;
            model.UpdateEndDate = end;
            model.StartDate = new DateTime(2027, 1, 1);
            model.EndDate = new DateTime(2025, 1, 1);
            await Submit(model);
            await AssertUnchanged(end ? "EndDate" : "StartDate");
        }

        [Fact]
        public async Task ChecksEveryPersonBeforeApplyingAnyChanges()
        {
            var second = new Person
            {
                Team = _person.Team, FirstName = "Second", LastName = "Person", Email = "second@example.test",
                StartDate = new DateTime(2026, 11, 1)
            };
            _context.People.Add(second);
            await _context.SaveChangesAsync();
            var model = CategoryUpdate();
            model.Ids += $",{second.Id}";
            model.UpdateEndDate = true;
            model.EndDate = new DateTime(2026, 6, 1);
            await Submit(model);
            await AssertUnchanged("EndDate");
            Assert.Null((await _context.People.SingleAsync(p => p.Id == second.Id)).EndDate);
        }

        [Fact]
        public async Task AllowsSameDayRangesAndExplicitClearing()
        {
            var model = CategoryUpdate();
            model.UpdateStartDate = model.UpdateEndDate = true;
            model.StartDate = model.EndDate = new DateTime(2026, 6, 1);
            await Submit(model);
            Assert.True(_controller.ModelState.IsValid);
            model.StartDate = model.EndDate = null;
            model.Category = "-- Not Set --";
            model.UpdateTags = model.UpdateSupervisorEmail = true;
            await Submit(model);
            Assert.True(_controller.ModelState.IsValid);
            Assert.Null(_person.StartDate);
            Assert.Null(_person.EndDate);
            Assert.Equal(string.Empty, _person.Category);
            Assert.Equal(string.Empty, _person.Tags);
        }

        [Theory]
        [InlineData("Category")]
        [InlineData("SelectedTags")]
        [InlineData("SupervisorEmail")]
        public async Task RejectsUnknownValuesAndSelfSupervision(string field)
        {
            var model = CategoryUpdate();
            model.Category = field == "Category" ? "Unknown" : "Faculty";
            model.UpdateTags = field == "SelectedTags";
            model.SelectedTags = new[] { "OtherTag" };
            model.UpdateSupervisorEmail = field == "SupervisorEmail";
            model.SupervisorEmail = _person.Email;
            await Submit(model);
            await AssertUnchanged(field);
        }

        [Fact]
        public async Task NormalizesSupportedCategorySupervisorAndTags()
        {
            var supervisor = new Person { Team = _person.Team, FirstName = "Team", LastName = "Supervisor", Email = "boss@example.test" };
            _context.People.Add(supervisor);
            await _context.SaveChangesAsync();
            var model = CategoryUpdate();
            model.Category = " faculty ";
            model.UpdateSupervisorEmail = model.UpdateTags = true;
            model.SupervisorEmail = " BOSS@example.test ";
            model.SelectedTags = new[] { "Existing", "Existing" };
            await Submit(model);
            Assert.True(_controller.ModelState.IsValid);
            Assert.Equal(supervisor.Id, _person.SupervisorId);
            Assert.Equal("Faculty", _person.Category);
            Assert.Equal("Existing", _person.Tags);
        }

        [Theory]
        [InlineData("missing")]
        [InlineData("other-team")]
        [InlineData("inactive")]
        [InlineData("ambiguous")]
        public async Task RejectsUnavailableOrAmbiguousSupervisors(string kind)
        {
            if (kind == "inactive" || kind == "ambiguous")
            {
                var supervisor = new Person
                {
                    Team = _person.Team, FirstName = "Boss", LastName = "Person",
                    Email = "boss@example.test", Active = kind != "inactive"
                };
                _context.People.Add(supervisor);
                if (kind == "ambiguous")
                    _context.People.Add(new Person { Team = _person.Team, FirstName = "Another", LastName = "Boss", Email = supervisor.Email });
                await _context.SaveChangesAsync();
            }
            var model = CategoryUpdate();
            model.UpdateSupervisorEmail = true;
            model.SupervisorEmail = kind == "other-team" ? _other.Email : "boss@example.test";
            await Submit(model);
            await AssertUnchanged("SupervisorEmail");
        }

        [Fact]
        public async Task DeletionIgnoresUnusedDateErrorsAndResetsDeleteAfterSuccess()
        {
            _notifications.Setup(service => service.PersonUpdated(_person, null, "test-team",
                It.IsAny<string>(), "editor", PersonNotification.Actions.Deactivated, "From Bulk Edit"))
                .Returns(Task.CompletedTask);
            var model = CategoryUpdate();
            model.DeleteUsers = model.UpdateStartDate = true;
            _controller.ModelState.AddModelError("StartDate", "Incomplete date");
            await Submit(model);
            Assert.True(_controller.ModelState.IsValid);
            Assert.False(model.DeleteUsers);
            Assert.False(_person.Active);
            Assert.Equal("Staff", _person.Category);
            Assert.True((await _context.People.SingleAsync(p => p.Id == _other.Id)).Active);
        }

        public void Dispose()
        {
            _context.Dispose();
            _connection.Dispose();
        }
    }
}
