using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Attributes;
using Keas.Mvc.Controllers;
using Keas.Mvc.Handlers;
using Keas.Mvc.Models;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Routing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace Test.TestsController
{
    [Trait("Category", "ControllerTests")]
    public class PersonAdminBulkEditTests : IDisposable
    {
        private const string ManagerId = "team-a-manager";
        private const string OriginalTags = "original";
        private const string UpdatedTags = "updated";
        private readonly SqliteConnection _connection;
        private readonly ApplicationDbContext _context;
        private readonly DefaultHttpContext _httpContext;
        private readonly VerifyRoleOrAuthTokenHandler _authorizationHandler;
        private readonly PersonAdminController _controller;
        private readonly Team _teamA = new Team { Name = "Team A", Slug = "team-a" };
        private readonly Team _teamB = new Team { Name = "Team B", Slug = "team-b" };
        private readonly Person _firstLocalPerson;
        private readonly Person _secondLocalPerson;
        private readonly Person _foreignPerson;

        public PersonAdminBulkEditTests()
        {
            _connection = new SqliteConnection("Data Source=:memory:");
            _connection.Open();
            _context = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite(_connection).Options);
            _context.Database.EnsureCreated();

            _context.TeamPermissions.Add(new TeamPermission
            {
                Team = _teamA,
                Role = new Role { Name = Role.Codes.PersonManager },
                User = new User
                {
                    Id = ManagerId,
                    FirstName = "Team A",
                    LastName = "Manager",
                    Email = "manager@example.test"
                }
            });
            // Targets have no assignments or permissions and are not the acting manager,
            // so the deactivation eligibility checks cannot hide the team-scoping defect.
            _firstLocalPerson = AddPerson(_teamA, "First");
            _secondLocalPerson = AddPerson(_teamA, "Second");
            _foreignPerson = AddPerson(_teamB, "Foreign");
            _context.SaveChanges();
            _context.ChangeTracker.Clear();

            _httpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, ManagerId),
                    new Claim("name", "Team A Manager")
                }, "Test")),
                Session = Mock.Of<ISession>()
            };
            var accessor = new HttpContextAccessor { HttpContext = _httpContext };
            var security = new SecurityService(accessor, _context,
                new TeamsManager(accessor, _context), Options.Create(new ApiSettings()));
            _authorizationHandler = new VerifyRoleOrAuthTokenHandler(security, accessor,
                Mock.Of<ITempDataDictionaryFactory>(MockBehavior.Strict));
            _controller = new PersonAdminController(_context,
                new NotificationService(_context, security), Mock.Of<IIdentityService>(MockBehavior.Strict))
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = _httpContext,
                    RouteData = new RouteData()
                },
                TempData = new TempDataDictionary(_httpContext, Mock.Of<ITempDataProvider>())
            };
        }

        // Issue #1407: a foreign ID must reject the entire batch, including any local IDs.
        [Theory]
        [InlineData(false, false)]
        [InlineData(false, true)]
        [InlineData(true, false)]
        [InlineData(true, true)]
        public async Task BulkEditWithForeignTeamIdsLeavesAllPeopleAndNotificationsUnchanged(
            bool deactivate, bool includeLocalPerson)
        {
            await AssertManagerCanAccessOnlyTeamA();
            var ids = includeLocalPerson
                ? $"{_firstLocalPerson.Id},{_foreignPerson.Id}"
                : _foreignPerson.Id.ToString();

            Assert.IsType<ViewResult>(await _controller.BulkEdit(CreateModel(ids, deactivate)));

            Assert.False(string.IsNullOrWhiteSpace(_controller.ErrorMessage));
            _context.ChangeTracker.Clear();
            var people = await _context.People.IgnoreQueryFilters().OrderBy(person => person.Id).ToArrayAsync();
            Assert.Equal(3, people.Length);
            Assert.All(people, person =>
            {
                Assert.True(person.Active, $"Person {person.Id} was deactivated by a batch containing a foreign-team ID.");
                Assert.Equal(OriginalTags, person.Tags);
            });
            Assert.Empty(await _context.PersonNotifications.ToListAsync());
        }

        [Theory]
        [InlineData(false, false)]
        [InlineData(false, true)]
        [InlineData(true, false)]
        [InlineData(true, true)]
        public async Task BulkEditWithOnlyAuthorizedTeamIdsUpdatesSelectedPeople(bool deactivate, bool includeDuplicateId)
        {
            await AssertManagerCanAccessOnlyTeamA();
            var ids = $"{_firstLocalPerson.Id},{_secondLocalPerson.Id}";
            if (includeDuplicateId)
            {
                ids += $",{_firstLocalPerson.Id}";
            }
            var model = CreateModel(ids, deactivate);

            var result = Assert.IsType<ViewResult>(await _controller.BulkEdit(model));

            Assert.Same(model, result.Model);
            _context.ChangeTracker.Clear();
            var people = await _context.People.IgnoreQueryFilters().ToArrayAsync();
            Assert.Equal(3, people.Length);
            var localPeople = people.Where(person => person.TeamId == _teamA.Id).ToArray();
            Assert.Equal(2, localPeople.Length);
            Assert.All(localPeople, person =>
            {
                Assert.Equal(!deactivate, person.Active);
                Assert.Equal(deactivate ? OriginalTags : UpdatedTags, person.Tags);
            });
            var foreignPerson = Assert.Single(people.Where(person => person.Id == _foreignPerson.Id));
            Assert.True(foreignPerson.Active);
            Assert.Equal(OriginalTags, foreignPerson.Tags);

            var notifications = await _context.PersonNotifications.OrderBy(notification => notification.PersonId).ToArrayAsync();
            if (deactivate)
            {
                Assert.Equal(new[] { _firstLocalPerson.Id, _secondLocalPerson.Id },
                    notifications.Select(notification => notification.PersonId));
                Assert.All(notifications, notification =>
                {
                    Assert.Equal(_teamA.Id, notification.TeamId);
                    Assert.Equal(ManagerId, notification.ActorId);
                    Assert.Equal(PersonNotification.Actions.Deactivated, notification.Action);
                });
            }
            else
            {
                Assert.Empty(notifications);
            }
        }

        private async Task AssertManagerCanAccessOnlyTeamA()
        {
            // Direct controller calls do not run MVC authorization filters. Exercise the
            // real handler and database-backed permissions before invoking the action.
            Assert.False(await AuthorizeTeam(_teamB.Slug));
            Assert.True(await AuthorizeTeam(_teamA.Slug));
        }

        private async Task<bool> AuthorizeTeam(string slug)
        {
            _httpContext.Request.RouteValues["teamName"] = slug;
            _controller.RouteData.Values["teamName"] = slug;
            var requirement = new VerifyRoleOrAuthToken(Role.Codes.PersonManager, Role.Codes.DepartmentalAdmin);
            var authorization = new AuthorizationHandlerContext(new[] { requirement }, _httpContext.User, _httpContext);
            await _authorizationHandler.HandleAsync(authorization);
            return authorization.HasSucceeded;
        }

        private static BulkEditModel CreateModel(string ids, bool deactivate)
        {
            return new BulkEditModel
            {
                Ids = ids,
                DeleteUsers = deactivate,
                UpdateTags = !deactivate,
                SelectedTags = new[] { UpdatedTags }
            };
        }

        private Person AddPerson(Team team, string firstName)
        {
            var person = new Person
            {
                Team = team,
                FirstName = firstName,
                LastName = "Person",
                Email = $"{firstName.ToLowerInvariant()}@example.test",
                Tags = OriginalTags
            };
            _context.People.Add(person);
            return person;
        }

        public void Dispose()
        {
            _context.Dispose();
            _connection.Dispose();
        }
    }
}
