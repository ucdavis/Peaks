using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using Keas.Mvc;
using Keas.Core.Data;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Test.Integration
{
    public class RuntimeUpgradeTests
    {
        [Theory]
        [InlineData("/api/test/equipment/search?q=test", false, HttpStatusCode.Redirect)]
        [InlineData("/api/test/equipment/search?q=test", true, HttpStatusCode.Unauthorized)]
        [InlineData("/confirm/selectteam", false, HttpStatusCode.Redirect)]
        [InlineData("/confirm/selectteam", true, HttpStatusCode.Unauthorized)]
        public async Task AnonymousRequestsKeepCookieChallengeBehavior(string path, bool xhr, HttpStatusCode expected)
        {
            using var connection = new SqliteConnection("Data Source=:memory:");
            connection.Open();
            var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseSqlite(connection).Options;
            using (var database = new ApplicationDbContext(options))
                database.Database.EnsureCreated();

            using var factory = new WebApplicationFactory<Startup>().WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Testing");
                builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(
                    new Dictionary<string, string> { ["Dev:UseSql"] = "No" }));
                // Keep authorization and routing real while isolating database access.
                builder.ConfigureTestServices(services =>
                    services.AddScoped<ApplicationDbContext>(_ => new ApplicationDbContext(options)));
            });
            using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
            {
                BaseAddress = new System.Uri("https://localhost"),
                AllowAutoRedirect = false
            });
            if (xhr)
                client.DefaultRequestHeaders.Add("X-Requested-With", "XMLHttpRequest");

            var response = await client.GetAsync(path);

            Assert.Equal(expected, response.StatusCode);
            Assert.Contains("/login", response.Headers.Location?.ToString());
        }
    }
}
