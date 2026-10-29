using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Keas.Core.Domain;
using Keas.Mvc;
using Microsoft.AspNetCore.Mvc.Testing;
using Test.Helpers;
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

                db.TeamPermissions.Add(new TeamPermission { Team = caes, Role = db.Roles.SingleOrDefault(r => r.Name == DepartmentalAdminRole), User = db.Users.SingleOrDefault(u => u.Id == IntegrationTestHelpers.TestUser) });

                db.SaveChanges();
            });

            // Act
            var response = await client.GetAsync(url);

            // Assert
            Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
            Assert.Equal("/caesdo/Confirm/MyStuff", response.Headers.Location.ToString());
        }

        [Theory]
        [InlineData("/teamname")]
        public async Task GetMyStuff(string url)
        {
            // Arrange
            var client = _factory.GetKeasClient(db =>
            {
                // create one team and give tester permissions
                var caes = new Team { Name = "teamname", Slug = "teamname" };
                db.Teams.Add(caes);

                db.TeamPermissions.Add(new TeamPermission { Team = caes, Role = db.Roles.SingleOrDefault(r => r.Name == DepartmentalAdminRole), User = db.Users.SingleOrDefault(u => u.Id == IntegrationTestHelpers.TestUser) });

                db.SaveChanges();
            });

            // Act
            var response = await client.GetAsync(url);

            // Assert
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();

            var document = new AngleSharp.Html.Parser.HtmlParser().ParseDocument(content);
            Assert.Contains(document.QuerySelectorAll("a[href='/teamname/People']"),
                link => link.TextContent.Contains("Team Assets"));
        }

        [Theory]
        [InlineData("/teamname/people")]
        [InlineData("/teamname/equipment/details/24")]
        [InlineData("/teamname/Report")]
        [InlineData("/teamname/TeamAdmin")]
        public async Task RazorPagesServeBuiltAssetsWithBootstrapBeforeReact(string url)
        {
            using var client = _factory.GetKeasClient(db =>
            {
                var team = new Team { Name = "teamname", Slug = "teamname" };
                db.Teams.Add(team);
                db.TeamPermissions.Add(new TeamPermission
                {
                    Team = team,
                    Role = db.Roles.Single(r => r.Name == DepartmentalAdminRole),
                    User = db.Users.Single(u => u.Id == IntegrationTestHelpers.TestUser)
                });
                db.SaveChanges();
            });

            var response = await client.GetAsync(url);
            response.EnsureSuccessStatusCode();
            var html = await response.Content.ReadAsStringAsync();
            var document = new AngleSharp.Html.Parser.HtmlParser().ParseDocument(html);
            var css = document.Head.QuerySelectorAll("link[rel=stylesheet]")
                .Where(link => link.GetAttribute("href").StartsWith("/vite/assets/"));
            Assert.NotEmpty(css);
            var entry = Assert.Single(document.QuerySelectorAll("script[type=module][src]"));
            Assert.StartsWith("/vite/assets/", entry.GetAttribute("src"));
            Assert.DoesNotContain("@vite/client", html);
            Assert.DoesNotContain("localhost:5179", html);
            Assert.NotNull(document.QuerySelector("#root"));
            if (url.Contains("/people") || url.Contains("/equipment"))
            {
                var scripts = document.QuerySelectorAll("script").ToList();
                var bootstrap = scripts.FindIndex(script => script.TextContent.Contains("window.App"));
                Assert.True(bootstrap >= 0);
                Assert.True(bootstrap < scripts.IndexOf(entry));
                Assert.NotNull(document.QuerySelector("input[name=__RequestVerificationToken]"));
            }
            foreach (var asset in css.Select(link => link.GetAttribute("href")).Append(entry.GetAttribute("src")))
            {
                var assetResponse = await client.GetAsync(asset);
                assetResponse.EnsureSuccessStatusCode();
            }
        }
    }
}
