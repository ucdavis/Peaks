using System.Linq;
using System.Net;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Keas.Core.Domain;
using Keas.Mvc;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Test.Integration
{
    public class BasicTests
        : IClassFixture<WebApplicationFactory<Startup>>
    {
        private string DepartmentalAdminRole = "DepartmentalAdmin";
        private readonly WebApplicationFactory<Startup> _factory;

        public BasicTests(WebApplicationFactory<Startup> factory)
        {
            _factory = factory;
        }

        [Theory]
        [InlineData("/confirm/selectteam")]
        public async Task GetTeamSelection(string url)
        {
            // Arrange
            var client = _factory.GetKeasClient(db =>
            {
                // create one team and give tester permissions
                var caes = new Team { Name = "CAESDO", Slug = "caesdo" };
                db.Teams.Add(caes);

                db.TeamPermissions.Add(new TeamPermission { Team = caes, Role = db.Roles.SingleOrDefault(r => r.Name == DepartmentalAdminRole), User = db.Users.SingleOrDefault(u => u.Id == TestHelpers.TestUser) });

                db.SaveChanges();
            });

            // Act
            var response = await client.GetAsync(url);

            // Assert
            Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
            Assert.Equal("/caesdo/Confirm/MyStuff", response.Headers.Location.ToString());
        }

        [Theory]
        [InlineData("/teamname", "teamname")]
        [InlineData("/teamnameFail", "teamnameFail")]
        [InlineData("/teamname1", "teamname1")]
        [InlineData("/teamname2", "teamname2")]
        [InlineData("/teamname3", "teamname3")]
        [InlineData("/teamname4", "teamname4")]
        [InlineData("/teamname5", "teamname5")]
        [InlineData("/teamname6", "teamname6")]
        [InlineData("/teamname7", "teamname7")]
        public async Task GetMyStuff(string url, string teamName)
        {
            // Arrange
            var client = _factory.GetKeasClient(db =>
            {
                // create one team and give tester permissions
                var caes = new Team { Name = teamName, Slug = teamName };
                db.Teams.Add(caes);

                db.TeamPermissions.Add(new TeamPermission { Team = caes, Role = db.Roles.SingleOrDefault(r => r.Name == DepartmentalAdminRole), User = db.Users.SingleOrDefault(u => u.Id == TestHelpers.TestUser) });

                db.SaveChanges();
            });

            // Act
            var response = await client.GetAsync(url);

            System.Console.WriteLine(response.Headers.Location);
            // Assert
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();

            Assert.Contains($"<a href='/{teamName}/People'>Team Assets</a>", content);
        }
    }
}
