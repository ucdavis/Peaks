using System;
using System.Net.Http;
using System.Net.Http.Headers;
using Keas.Core.Data;
using Keas.Mvc;
using Keas.Mvc.Helpers;
using Keas.Mvc.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace Test.Integration
{
    public static class TestHelpers {
        // Id of test user
        public static string TestUser = "tester";

        // helper to get web client that all tests can use
        public static HttpClient GetKeasClient(this WebApplicationFactory<Startup> factory, Action<ApplicationDbContext> dbInitializer)
        {
            var client = factory.WithWebHostBuilder(builder =>
            {
                builder.UseSetting("Environment", "Testing"); // test env doesn't load user secrets or other `env.IsDevelopment()` stuff like webpack
                builder.ConfigureServices(services =>
                {
                    // user our test auth, which just fake returns a test user
                    services.AddAuthentication("Test")
                        .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
                            "Test", options => { });

                    var sp = services.BuildServiceProvider();

                    using (var scope = sp.CreateScope())
                    {
                        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                        db.Database.EnsureDeleted();
                        db.Database.EnsureCreated();

                        // init db here
                        var dbinit = new DbInitializer(db, new SuperuserSettings { Kerb = TestUser, FirstName = "Testy", LastName = "Tester", Email = "test@test.com" });

                        dbinit.Initialize();

                        dbInitializer(db);
                    }
                });
            })
            .CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false,
            });

            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Test");

            return client;
        }
    }
}