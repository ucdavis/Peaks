using System;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Controllers.Api;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Moq;
using Shouldly;
using Xunit;

namespace Test.TestsController
{
    [Trait("Category", "ControllerTests")]
    public class ApiPeopleAdminControllerTests
    {
        [Fact]
        public async Task Delete_ReturnsBadRequest_WhenPersonHasTeamPermission()
        {
            using var connection = new SqliteConnection("DataSource=:memory:");
            await connection.OpenAsync();

            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite(connection)
                .Options;

            await using var context = new ApplicationDbContext(options);
            await context.Database.EnsureCreatedAsync();

            var team = new Team { Name = "Test Team", Slug = "test-team" };
            var actingUser = new User
            {
                Id = "person-manager",
                FirstName = "Person",
                LastName = "Manager",
                Email = "person-manager@example.com"
            };
            var targetUser = new User
            {
                Id = "departmental-admin",
                FirstName = "Departmental",
                LastName = "Admin",
                Email = "departmental-admin@example.com"
            };
            var actingPerson = new Person
            {
                Team = team,
                User = actingUser,
                FirstName = actingUser.FirstName,
                LastName = actingUser.LastName,
                Email = actingUser.Email
            };
            var targetPerson = new Person
            {
                Team = team,
                User = targetUser,
                FirstName = targetUser.FirstName,
                LastName = targetUser.LastName,
                Email = targetUser.Email
            };
            var departmentalAdminRole = new Role { Name = Role.Codes.DepartmentalAdmin };
            var teamPermission = new TeamPermission
            {
                Team = team,
                User = targetUser,
                Role = departmentalAdminRole
            };

            context.AddRange(actingPerson, targetPerson, teamPermission);
            await context.SaveChangesAsync();

            var personListResult = context.Database.GetDbConnection()
                .Query(PeopleQueries.List, new { teamId = team.Id, active1 = 1, active2 = 1 })
                .Single(x => x.Id == targetPerson.Id);
            Convert.ToInt32((object)personListResult.TeamPermissionCount).ShouldBe(1);

            var securityService = new Mock<ISecurityService>();
            securityService.Setup(x => x.GetPerson(team.Slug)).ReturnsAsync(actingPerson);

            var controller = new PeopleAdminController(
                context,
                Mock.Of<IIdentityService>(),
                Mock.Of<INotificationService>(),
                securityService.Object);
            var routeData = new RouteData();
            routeData.Values["teamName"] = team.Slug;
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext(),
                RouteData = routeData
            };

            var result = await controller.Delete(targetPerson.Id);

            result.ShouldBeOfType<BadRequestObjectResult>();
            controller.ModelState["TeamPermissions"].Errors.Single().ErrorMessage
                .ShouldBe("Remove Team Permissions first");

            context.ChangeTracker.Clear();
            (await context.People.SingleAsync(x => x.Id == targetPerson.Id)).Active.ShouldBeTrue();
            (await context.TeamPermissions.CountAsync(x => x.UserId == targetUser.Id && x.TeamId == team.Id))
                .ShouldBe(1);
        }
    }
}
