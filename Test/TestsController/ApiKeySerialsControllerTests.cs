using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Core.Resources;
using Keas.Mvc.Controllers.Api;
using Keas.Mvc.Models.KeySerialViewModels;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Moq;
using Newtonsoft.Json;
using Xunit;

namespace Test.TestsController
{
    [Trait("Category", "ControllerTests")]
    public class ApiKeySerialsControllerTests : IDisposable
    {
        private const string ParentTags = "parent-only";
        private readonly SqliteConnection _connection;
        private readonly ApplicationDbContext _context;
        private readonly Mock<IEventService> _events = new Mock<IEventService>();
        private readonly Mock<ISecurityService> _security = new Mock<ISecurityService>();
        private readonly KeySerialsController _controller;
        private readonly Key _key;

        public ApiKeySerialsControllerTests()
        {
            _connection = new SqliteConnection("Data Source=:memory:");
            _connection.Open();
            _context = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite(_connection).Options);
            _context.Database.EnsureCreated();
            _key = new Key
            {
                Name = "Test key",
                Code = "TEST",
                Tags = ParentTags,
                Team = new Team { Name = "Test team", Slug = "test-team" }
            };
            _context.Keys.Add(_key);
            _context.SaveChanges();

            _events.Setup(e => e.TrackCreateKeySerial(It.IsAny<KeySerial>())).Returns(Task.CompletedTask);
            _events.Setup(e => e.TrackUpdateKeySerial(It.IsAny<KeySerial>())).Returns(Task.CompletedTask);
            _controller = new KeySerialsController(_context, _events.Object, _security.Object)
            {
                ControllerContext = new ControllerContext { RouteData = new RouteData() }
            };
            _controller.RouteData.Values["teamName"] = _key.Team.Slug;
        }

        [Theory]
        [InlineData("spare,front-desk")]
        [InlineData("")]
        [InlineData(null)]
        public async Task CreatePersistsAndReturnsSerialTagsIndependentlyOfParent(string tags)
        {
            var expectedTags = tags ?? string.Empty;
            var result = await _controller.Create(new CreateKeySerialViewModel
            {
                KeyId = _key.Id,
                Number = "001",
                Tags = tags
            });

            var serial = Assert.IsType<KeySerial>(Assert.IsType<JsonResult>(result).Value);
            Assert.Equal(expectedTags, serial.Tags);
            _events.Verify(e => e.TrackCreateKeySerial(It.Is<KeySerial>(s => s.Tags == expectedTags)), Times.Once);
            _context.ChangeTracker.Clear();
            Assert.Equal(expectedTags, (await _context.KeySerials.SingleAsync()).Tags);
            Assert.Equal(ParentTags, (await _context.Keys.SingleAsync()).Tags);
        }

        [Theory]
        [InlineData("replacement,front-desk")]
        [InlineData("")]
        public async Task UpdateReplacesOrClearsSerialTagsIndependentlyOfParent(string tags)
        {
            var serial = await AddSerial("original");

            var result = await _controller.Update(serial.Id, new UpdateKeySerialViewModel
            {
                Number = serial.Number,
                Status = KeySerialStatusModel.Active,
                Tags = tags
            });

            Assert.Equal(tags, Assert.IsType<KeySerial>(Assert.IsType<JsonResult>(result).Value).Tags);
            _events.Verify(e => e.TrackUpdateKeySerial(It.Is<KeySerial>(s => s.Tags == tags)), Times.Once);
            _context.ChangeTracker.Clear();
            Assert.Equal(tags, (await _context.KeySerials.SingleAsync()).Tags);
            Assert.Equal(ParentTags, (await _context.Keys.SingleAsync()).Tags);
        }

        [Fact]
        public async Task UpdateWithoutTagsPreservesThemWhileSavingOtherChanges()
        {
            var serial = await AddSerial("original");
            var model = JsonConvert.DeserializeObject<UpdateKeySerialViewModel>(
                "{\"notes\":\"Updated notes\",\"number\":\"002\",\"status\":\"Lost\"}");

            var result = await _controller.Update(serial.Id, model);

            Assert.Equal("original", Assert.IsType<KeySerial>(Assert.IsType<JsonResult>(result).Value).Tags);
            _context.ChangeTracker.Clear();
            var saved = await _context.KeySerials.SingleAsync();
            Assert.Equal("original", saved.Tags);
            Assert.Equal("Updated notes", saved.Notes);
            Assert.Equal("002", saved.Number);
            Assert.Equal(KeySerialStatusModel.Lost, saved.Status);
            Assert.Equal(ParentTags, (await _context.Keys.SingleAsync()).Tags);
        }

        [Fact]
        public async Task CreateAndUpdateRejectKeysFromAnotherTeam()
        {
            var serial = await AddSerial("original");
            _controller.RouteData.Values["teamName"] = "another-team";

            Assert.IsType<BadRequestResult>(await _controller.Create(new CreateKeySerialViewModel
            {
                KeyId = _key.Id,
                Number = "002",
                Tags = "unauthorized"
            }));
            Assert.IsType<BadRequestResult>(await _controller.Update(serial.Id, new UpdateKeySerialViewModel
            {
                Number = serial.Number,
                Status = KeySerialStatusModel.Active,
                Tags = "unauthorized"
            }));

            _context.ChangeTracker.Clear();
            Assert.Equal("original", (await _context.KeySerials.SingleAsync()).Tags);
            _events.Verify(e => e.TrackCreateKeySerial(It.IsAny<KeySerial>()), Times.Never);
            _events.Verify(e => e.TrackUpdateKeySerial(It.IsAny<KeySerial>()), Times.Never);
        }

        [Fact]
        public async Task DetailsListsAndSearchesReturnSerialTags()
        {
            var serial = await AddSerial("spare,front-desk");
            _context.ChangeTracker.Clear();

            var details = Assert.IsType<JsonResult>(await _controller.Details(serial.Id));
            Assert.Equal(serial.Tags, Assert.IsType<KeySerial>(details.Value).Tags);

            var lists = new[]
            {
                await _controller.GetForKey(_key.Id),
                await _controller.Search(serial.Number),
                await _controller.SearchInKey(_key.Id, serial.Number)
            };
            foreach (var result in lists)
            {
                var returned = Assert.Single(Assert.IsAssignableFrom<IEnumerable<KeySerial>>(
                    Assert.IsType<JsonResult>(result).Value));
                Assert.Equal(serial.Tags, returned.Tags);
                Assert.Equal(ParentTags, returned.Key.Tags);
            }
        }

        [Fact]
        public async Task KeyReportsIncludeSeparateSerialAndParentTags()
        {
            var serial = await AddSerial("serial-only");
            _context.ChangeTracker.Clear();
            var reports = new ReportService(_context, _security.Object);

            var keyReport = Assert.Single(await reports.Keys(_key.Team, _key.Team.Slug));

            Assert.Equal(ParentTags, keyReport.Tags);
            Assert.Equal(serial.Tags, Assert.Single(keyReport.Serials).Tags);
        }

        private async Task<KeySerial> AddSerial(string tags)
        {
            var serial = new KeySerial
            {
                Key = _key,
                Team = _key.Team,
                Name = "001",
                Number = "001",
                Tags = tags
            };
            _context.KeySerials.Add(serial);
            await _context.SaveChangesAsync();
            return serial;
        }

        public void Dispose()
        {
            _context.Dispose();
            _connection.Dispose();
        }
    }
}
