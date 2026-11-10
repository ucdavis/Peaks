using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Core.Extensions;
using Keas.Core.Services;
using Keas.Mvc;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using Moq;
using UCD.Rosetta.Client.Core.Configuration;
using UCD.Rosetta.Client.Generated;
using Xunit;
using Person = Keas.Core.Domain.Person;
using RosettaPerson = UCD.Rosetta.Client.Generated.Person;

namespace Test.Integration
{
    public class RosettaServicesTests
    {
        [Theory]
        [InlineData(null, typeof(IdentityService), typeof(UpdateFromIamService))]
        [InlineData("false", typeof(IdentityService), typeof(UpdateFromIamService))]
        [InlineData("true", typeof(RosettaIdentityService), typeof(UpdateFromRosettaService))]
        public void MvcStartupSelectsBothDirectoryServicesFromTheFeatureFlag(string enabled, System.Type identityType, System.Type updateType)
        {
            var configuration = Configuration(new Dictionary<string, string>
            {
                ["FeatureFlags:UseRosetta"] = enabled
            });
            var environment = new Mock<IWebHostEnvironment>();
            environment.SetupGet(value => value.EnvironmentName).Returns("Production");
            var services = new ServiceCollection();

            new Startup(configuration, environment.Object).ConfigureServices(services);

            using var files = (IDisposable)Assert.Single(services.Where(service => service.ServiceType == typeof(IFileProvider))).ImplementationInstance;
            var identity = Assert.Single(services.Where(service => service.ServiceType == typeof(IIdentityService)));
            Assert.Equal(identityType, identity.ImplementationType);
            Assert.Equal(ServiceLifetime.Scoped, identity.Lifetime);
            var updater = Assert.Single(services.Where(service => service.ServiceType == typeof(IUpdateFromIamService)));
            if (updateType == typeof(UpdateFromRosettaService))
                Assert.NotNull(updater.ImplementationFactory);
            else
                Assert.Equal(updateType, updater.ImplementationType);
        }

        [Theory]
        [InlineData(null, null)]
        [InlineData("false", null)]
        [InlineData("false", 0)]
        [InlineData("false", -1)]
        public void MissingOrDisabledFlagKeepsIamWithoutRosettaConfiguration(string enabled, int? batchSize)
        {
            using var database = new TestDatabase();
            var configuration = Configuration(new Dictionary<string, string>
            {
                ["FeatureFlags:UseRosetta"] = enabled,
                ["LivedName:BatchSize"] = batchSize?.ToString()
            });
            var services = new ServiceCollection();
            services.AddSingleton(database.Context);
            services.AddDirectoryServices(configuration);
            using var provider = services.BuildServiceProvider();
            using var scope = provider.CreateScope();

            Assert.IsType<UpdateFromIamService>(scope.ServiceProvider.GetRequiredService<IUpdateFromIamService>());
            Assert.Null(scope.ServiceProvider.GetService<IClient>());
            Assert.DoesNotContain(services, service => service.ServiceType == typeof(IConfigureOptions<RosettaClientOptions>));
        }

        [Fact]
        public void EnabledFlagResolvesRosettaAndBindsItsConfiguration()
        {
            using var database = new TestDatabase();
            var configuration = Configuration(new Dictionary<string, string>
            {
                ["FeatureFlags:UseRosetta"] = "true",
                ["RosettaClient:BaseUrl"] = "https://rosetta.example/api/{version}",
                ["RosettaClient:TokenUrl"] = "https://auth.example/token",
                ["RosettaClient:ClientId"] = "test-client",
                ["RosettaClient:ClientSecret"] = "test-only-placeholder",
                ["RosettaClient:ApiVersion"] = "v1",
                ["RosettaClient:Scope"] = "read:public read:healthEmail"
            });
            var services = new ServiceCollection();
            services.AddSingleton(database.Context);
            services.AddDirectoryServices(configuration);
            using var provider = services.BuildServiceProvider();
            using var scope = provider.CreateScope();

            Assert.IsType<UpdateFromRosettaService>(scope.ServiceProvider.GetRequiredService<IUpdateFromIamService>());
            var client = Assert.IsType<Client>(scope.ServiceProvider.GetRequiredService<IClient>());
            Assert.Equal("https://rosetta.example/api/v1/", client.BaseUrl);
            Assert.Equal("read:public read:healthEmail", scope.ServiceProvider.GetRequiredService<IOptions<RosettaClientOptions>>().Value.Scope);
        }

        [Fact]
        public async Task RosettaIdentityResolvesAndLooksUpUsersWithoutIamDependencies()
        {
            using var database = new TestDatabase();
            var record = DirectoryPerson(0);
            using var handler = new RosettaHandler(request => Task.FromResult(new[] { record }));
            using var http = new HttpClient(handler);
            var services = new ServiceCollection();
            services.AddSingleton(database.Context);
            services.AddSingleton<IClient>(CreateClient(http));
            services.AddSingleton(Mock.Of<INotificationService>(MockBehavior.Strict));
            services.AddScoped<IIdentityService, RosettaIdentityService>();
            using var provider = services.BuildServiceProvider(new ServiceProviderOptions
            {
                ValidateOnBuild = true,
                ValidateScopes = true
            });
            using var scope = provider.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IIdentityService>();

            var user = await service.GetByKerberos(record.Id.Login_id);

            Assert.IsType<RosettaIdentityService>(service);
            Assert.Equal(record.Iam_id, user.Iam);
            Assert.Equal(record.Id.Login_id, user.Id);
            Assert.Equal(record.Email.Campus, user.Email);
            Assert.Equal("Primary title", await service.GetTitle(user.Iam));
        }

        [Fact]
        public async Task FullSyncRequestsOnlyNeededFieldsInGraphQlBatchesOfFiftyAndExcludesEmptyIamIds()
        {
            using var database = new TestDatabase();
            var records = Enumerable.Range(0, 101).Select(DirectoryPerson).ToDictionary(person => person.Iam_id);
            database.Context.Users.AddRange(records.Values.Select(LocalUser));
            database.Context.Users.Add(new User { Id = "no-iam", FirstName = "Old", LastName = "Name", Email = "no-iam@example.com" });
            database.Context.Users.Add(new User { Id = "blank-iam", Iam = " ", FirstName = "Old", LastName = "Name", Email = "blank-iam@example.com" });
            await database.Context.SaveChangesAsync();
            database.Context.ChangeTracker.Clear();
            var batches = new List<string[]>();
            using var handler = new RosettaHandler(async request =>
            {
                using var body = JsonDocument.Parse(await request.Content.ReadAsStringAsync());
                var filter = AssertGraphQlRequest(request, body);
                var ids = filter.GetProperty("iamids").EnumerateArray().Select(value => value.GetString()).ToArray();
                Assert.InRange(filter.GetProperty("limit").GetInt32(), ids.Length, 50);
                Assert.Equal(0, filter.GetProperty("offset").GetInt32());
                batches.Add(ids);
                return ids.Select(id => records[id]).ToArray();
            });
            using var http = new HttpClient(handler);
            var service = new UpdateFromRosettaService(CreateClient(http), database.Context);

            Assert.Equal(101, await service.UpdateAllUsersFromIam());

            Assert.Equal(new[] { 50, 50, 1 }, batches.Select(batch => batch.Length));
            Assert.Equal(records.Keys.OrderBy(id => id), batches.SelectMany(batch => batch).OrderBy(id => id));
            database.Context.ChangeTracker.Clear();
            Assert.Equal(101, await database.Context.Users.CountAsync(user => user.FirstName == "Lived"));
            Assert.Equal("Old", (await database.Context.Users.FindAsync("no-iam")).FirstName);
        }

        [Fact]
        public async Task ConfiguredBatchSizeControlsGraphQlRequestsThroughDependencyInjection()
        {
            using var database = new TestDatabase();
            var records = Enumerable.Range(0, 5).Select(DirectoryPerson).ToDictionary(person => person.Iam_id);
            database.Context.Users.AddRange(records.Values.Select(LocalUser));
            await database.Context.SaveChangesAsync();
            var batchCounts = new List<int>();
            using var handler = new RosettaHandler(async request =>
            {
                using var body = JsonDocument.Parse(await request.Content.ReadAsStringAsync());
                var filter = AssertGraphQlRequest(request, body);
                var ids = filter.GetProperty("iamids").EnumerateArray().Select(value => value.GetString()).ToArray();
                Assert.InRange(filter.GetProperty("limit").GetInt32(), ids.Length, 2);
                batchCounts.Add(ids.Length);
                return ids.Select(id => records[id]).ToArray();
            });
            using var http = new HttpClient(handler);
            var services = new ServiceCollection();
            services.AddSingleton(database.Context);
            services.AddDirectoryServices(Configuration(new Dictionary<string, string>
            {
                ["FeatureFlags:UseRosetta"] = "true",
                ["LivedName:BatchSize"] = "2"
            }));
            services.AddSingleton<IClient>(CreateClient(http));
            using var provider = services.BuildServiceProvider();
            using var scope = provider.CreateScope();

            Assert.Equal(5, await scope.ServiceProvider.GetRequiredService<IUpdateFromIamService>().UpdateAllUsersFromIam());

            Assert.Equal(new[] { 2, 2, 1 }, batchCounts);
        }

        [Theory]
        [InlineData(0)]
        [InlineData(-1)]
        public void RosettaRejectsNonPositiveBatchSizes(int batchSize)
        {
            using var database = new TestDatabase();
            var client = Mock.Of<IClient>(MockBehavior.Strict);
            Assert.Throws<ArgumentOutOfRangeException>(() => new UpdateFromRosettaService(client, database.Context, batchSize));
            var services = new ServiceCollection();
            services.AddSingleton(database.Context);
            services.AddDirectoryServices(Configuration(new Dictionary<string, string>
            {
                ["FeatureFlags:UseRosetta"] = "true",
                ["LivedName:BatchSize"] = batchSize.ToString()
            }));
            services.AddSingleton(client);
            using var provider = services.BuildServiceProvider();
            using var scope = provider.CreateScope();

            Assert.Throws<ArgumentOutOfRangeException>(() => scope.ServiceProvider.GetRequiredService<IUpdateFromIamService>());
        }

        [Fact]
        public async Task SyncPreservesInvalidOrMissingRecordsAndSeparatesEmailOnlyChanges()
        {
            using var database = new TestDatabase();
            var records = Enumerable.Range(0, 7).Select(DirectoryPerson).ToArray();
            var users = records.Select(LocalUser).ToArray();
            database.Context.Users.AddRange(users);
            var team = new Team { Name = "Sync team", Slug = "sync-team" };
            var active = TeamPerson(users[0], team);
            var inactive = TeamPerson(users[0], new Team { Name = "Inactive team", Slug = "inactive-team" });
            inactive.Active = false;
            database.Context.People.AddRange(active, inactive);
            await database.Context.SaveChangesAsync();
            var activeId = active.Id;
            var inactiveId = inactive.Id;
            database.Context.ChangeTracker.Clear();
            records[1].Name.Lived_first_name = "Old";
            records[1].Name.Lived_last_name = "Name";
            records[1].Name.Lived_pronouns = "old pronouns";
            records[2].Name.Lived_first_name = " ";
            records[4].Name.Lived_first_name = "Old";
            records[4].Name.Lived_last_name = "Name";
            records[4].Name.Lived_pronouns = null;
            records[4].Email.Campus = " ";
            records[5].Name = null;
            records[6].Name.Lived_first_name = "Old";
            records[6].Name.Lived_last_name = "Name";
            records[6].Name.Lived_pronouns = "old pronouns";
            records[6].Email = null;
            using var handler = new RosettaHandler(request => Task.FromResult(records.Where((person, index) => index != 3).ToArray()));
            using var http = new HttpClient(handler);
            var service = new UpdateFromRosettaService(CreateClient(http), database.Context);

            Assert.Equal(2, await service.UpdateAllUsersFromIam());

            database.Context.ChangeTracker.Clear();
            var saved = await database.Context.Users.OrderBy(user => user.Id).ToArrayAsync();
            Assert.Equal("Lived", saved[0].FirstName);
            Assert.Equal("Person", saved[0].LastName);
            Assert.Equal("they/them", saved[0].Pronouns);
            Assert.Equal(records[0].Email.Campus, saved[0].Email);
            Assert.Equal("Old", saved[1].FirstName);
            Assert.Equal(records[1].Email.Campus, saved[1].Email);
            foreach (var index in new[] { 2, 3, 5, 6 })
            {
                Assert.Equal("Old", saved[index].FirstName);
                Assert.Equal("old pronouns", saved[index].Pronouns);
                Assert.Equal($"old-{index}@example.com", saved[index].Email);
            }
            Assert.Null(saved[4].Pronouns);
            Assert.Equal("old-4@example.com", saved[4].Email);
            var savedActive = await database.Context.People.SingleAsync(person => person.Id == activeId);
            Assert.Equal("Lived", savedActive.FirstName);
            Assert.Equal("Person", savedActive.LastName);
            Assert.Equal("old-0@example.com", savedActive.Email);
            var savedInactive = await database.Context.People.IgnoreQueryFilters().SingleAsync(person => person.Id == inactiveId);
            Assert.Equal("Old", savedInactive.FirstName);
            Assert.False(savedInactive.Active);
        }

        [Theory]
        [InlineData(null, 50)]
        [InlineData(2, 2)]
        public async Task IncrementalSyncPagesChangesAndUpdatesOnlyLocalUsers(int? batchSize, int expectedBatchSize)
        {
            using var database = new TestDatabase();
            var records = Enumerable.Range(0, expectedBatchSize * 2 + 1).Select(DirectoryPerson).ToArray();
            database.Context.Users.AddRange(LocalUser(records[^2]), LocalUser(records[^1]));
            await database.Context.SaveChangesAsync();
            database.Context.ChangeTracker.Clear();
            var offsets = new List<int>();
            using var handler = new RosettaHandler(async request =>
            {
                using var body = JsonDocument.Parse(await request.Content.ReadAsStringAsync());
                var filter = AssertGraphQlRequest(request, body);
                Assert.Equal(expectedBatchSize, filter.GetProperty("limit").GetInt32());
                Assert.Contains(filter.GetProperty("modifiedsince").GetString(), new[] { "3d", "4d" });
                var offset = filter.GetProperty("offset").GetInt32();
                offsets.Add(offset);
                return records.Skip(offset).Take(expectedBatchSize).ToArray();
            });
            using var http = new HttpClient(handler);
            var service = new UpdateFromRosettaService(CreateClient(http), database.Context, batchSize);

            Assert.Equal(2, await service.UpdateUsersFromLastModifiedDateInIam(DateTime.UtcNow.Date.AddDays(-2)));

            Assert.Equal(new[] { 0, expectedBatchSize, expectedBatchSize * 2 }, offsets);
            database.Context.ChangeTracker.Clear();
            Assert.Equal(2, await database.Context.Users.CountAsync());
            Assert.All(await database.Context.Users.ToListAsync(), user => Assert.Equal("Lived", user.FirstName));
        }

        [Theory]
        [InlineData("top-level-errors")]
        [InlineData("people-errors")]
        [InlineData("missing-data")]
        [InlineData("null-data")]
        [InlineData("missing-people")]
        [InlineData("null-people")]
        [InlineData("missing-results")]
        [InlineData("null-results")]
        public async Task GraphQlErrorsAndIncompleteResponsesDoNotApplyPartialResults(string failure)
        {
            using var database = new TestDatabase();
            var record = DirectoryPerson(0);
            database.Context.Users.Add(LocalUser(record));
            await database.Context.SaveChangesAsync();
            database.Context.ChangeTracker.Clear();
            var response = GraphQlResponse(new[] { record });
            var data = (Dictionary<string, object>)response["data"];
            var people = (Dictionary<string, object>)data["people"];
            switch (failure)
            {
                case "top-level-errors": response["errors"] = new[] { new { message = "Partial directory failure" } }; break;
                case "people-errors": people["errors"] = new[] { new { parameter = "iamids", message = "Invalid filter" } }; break;
                case "missing-data": response.Remove("data"); break;
                case "null-data": response["data"] = null; break;
                case "missing-people": data.Remove("people"); break;
                case "null-people": data["people"] = null; break;
                case "missing-results": people.Remove("results"); break;
                case "null-results": people["results"] = null; break;
            }
            using var handler = new RosettaHandler(response);
            using var http = new HttpClient(handler);
            var service = new UpdateFromRosettaService(CreateClient(http), database.Context);

            await Assert.ThrowsAsync<InvalidOperationException>(() => service.UpdateAllUsersFromIam());

            database.Context.ChangeTracker.Clear();
            var saved = await database.Context.Users.SingleAsync();
            Assert.Equal("Old", saved.FirstName);
            Assert.Equal("old pronouns", saved.Pronouns);
            Assert.Equal("old-0@example.com", saved.Email);
        }

        [Theory]
        [InlineData("missing")]
        [InlineData("null")]
        [InlineData("empty")]
        public async Task GraphQlHandlesAbsentArraysAndSelectsCompleteNamesAndNonblankCampusEmails(string arrayShape)
        {
            using var database = new TestDatabase();
            var records = Enumerable.Range(0, 3).Select(DirectoryPerson).ToArray();
            database.Context.Users.AddRange(records.Select(LocalUser));
            await database.Context.SaveChangesAsync();
            database.Context.ChangeTracker.Clear();
            var missingName = new Dictionary<string, object>
            {
                ["iam_id"] = records[0].Iam_id,
                ["email"] = new[] { records[0].Email }
            };
            var missingEmail = new Dictionary<string, object>
            {
                ["iam_id"] = records[1].Iam_id,
                ["name"] = new[] { null, new Name { Lived_first_name = "Incomplete" }, records[1].Name }
            };
            if (arrayShape != "missing")
            {
                missingName["name"] = arrayShape == "null" ? null : Array.Empty<Name>();
                missingEmail["email"] = arrayShape == "null" ? null : Array.Empty<Email>();
            }
            var response = GraphQlResponse(Array.Empty<RosettaPerson>());
            var people = (Dictionary<string, object>)((Dictionary<string, object>)response["data"])["people"];
            people["results"] = new object[]
            {
                missingName,
                missingEmail,
                new
                {
                    iam_id = records[2].Iam_id,
                    name = new[] { records[2].Name },
                    email = new[] { null, new Email { Campus = " " }, records[2].Email }
                }
            };
            using var handler = new RosettaHandler(response);
            using var http = new HttpClient(handler);
            var service = new UpdateFromRosettaService(CreateClient(http), database.Context);

            Assert.Equal(2, await service.UpdateAllUsersFromIam());

            database.Context.ChangeTracker.Clear();
            var saved = await database.Context.Users.OrderBy(user => user.Id).ToArrayAsync();
            Assert.Equal("Old", saved[0].FirstName);
            Assert.Equal("old-0@example.com", saved[0].Email);
            Assert.Equal("Lived", saved[1].FirstName);
            Assert.Equal("old-1@example.com", saved[1].Email);
            Assert.Equal("Lived", saved[2].FirstName);
            Assert.Equal(records[2].Email.Campus, saved[2].Email);
        }

        [Theory]
        [InlineData("first-name", false)]
        [InlineData("first-name", true)]
        [InlineData("last-name", false)]
        [InlineData("last-name", true)]
        [InlineData("login", false)]
        [InlineData("login", true)]
        [InlineData("iam", false)]
        [InlineData("iam", true)]
        [InlineData("email", false)]
        public async Task IdentityLookupRejectsIncompleteDirectoryRecords(string missing, bool useHealthEmail)
        {
            using var database = new TestDatabase();
            var record = DirectoryPerson(0);
            if (useHealthEmail)
            {
                record.Email.Campus = null;
                record.Email.Health = "health@example.com";
            }
            switch (missing)
            {
                case "first-name": record.Name.Lived_first_name = null; break;
                case "last-name": record.Name.Lived_last_name = " "; break;
                case "login": record.Id.Login_id = null; break;
                case "iam": record.Iam_id = null; break;
                case "email": record.Email = null; break;
            }
            using var handler = new RosettaHandler(request => Task.FromResult(new[] { record }));
            using var http = new HttpClient(handler);
            var service = Identity(CreateClient(http), database.Context, Mock.Of<INotificationService>(MockBehavior.Strict));

            Assert.Null(await service.GetByKerberos("user000"));
            Assert.Empty(await database.Context.Users.ToListAsync());
        }

        [Fact]
        public async Task IdentityLookupMapsLivedNamesAndRejectsAmbiguousIdentities()
        {
            using var database = new TestDatabase();
            var record = DirectoryPerson(0);
            var response = new[] { record };
            using var handler = new RosettaHandler(request => Task.FromResult(response));
            using var http = new HttpClient(handler);
            var service = Identity(CreateClient(http), database.Context, Mock.Of<INotificationService>(MockBehavior.Strict));

            var user = await service.GetByKerberos(record.Id.Login_id);

            Assert.Equal(record.Iam_id, user.Iam);
            Assert.Equal(record.Id.Login_id, user.Id);
            Assert.Equal("Lived", user.FirstName);
            Assert.Equal("Person", user.LastName);
            Assert.Equal("they/them", user.Pronouns);
            Assert.Equal(record.Email.Campus, user.Email);
            Assert.Equal("Primary title", await service.GetTitle(record.Iam_id));
            Assert.Equal("1999999999", await service.GetIamSupervisor(record.Iam_id));
            response = new[] { record, DirectoryPerson(1) };
            await Assert.ThrowsAsync<InvalidOperationException>(() => service.GetByEmail("shared@example.com"));
        }

        [Theory]
        [InlineData(null, "health@example.com")]
        [InlineData("", "health@example.com")]
        [InlineData(" ", "health@example.com")]
        [InlineData("campus@example.com", "campus@example.com")]
        public async Task KerberosLookupUsesHealthEmailWhenCampusEmailIsMissing(string campusEmail, string expectedEmail)
        {
            using var database = new TestDatabase();
            var record = DirectoryPerson(0);
            record.Email.Campus = campusEmail;
            record.Email.Health = "health@example.com";
            using var handler = new RosettaHandler(request => Task.FromResult(new[] { record }));
            using var http = new HttpClient(handler);
            var service = Identity(CreateClient(http), database.Context, Mock.Of<INotificationService>(MockBehavior.Strict));

            var user = await service.GetByKerberos(record.Id.Login_id);

            Assert.NotNull(user);
            Assert.Equal(record.Iam_id, user.Iam);
            Assert.Equal(record.Id.Login_id, user.Id);
            Assert.Equal(expectedEmail, user.Email);
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData(" ")]
        [InlineData("not-an-email")]
        [InlineData("***")]
        public async Task KerberosLookupRejectsMissingOrInvalidHealthEmailWhenCampusEmailIsMissing(string healthEmail)
        {
            using var database = new TestDatabase();
            var record = DirectoryPerson(0);
            record.Email.Campus = null;
            record.Email.Health = healthEmail;
            using var handler = new RosettaHandler(request => Task.FromResult(new[] { record }));
            using var http = new HttpClient(handler);
            var service = Identity(CreateClient(http), database.Context, Mock.Of<INotificationService>(MockBehavior.Strict));

            Assert.Null(await service.GetByKerberos(record.Id.Login_id));
            Assert.Empty(await database.Context.Users.ToListAsync());
        }

        [Theory]
        [InlineData(null, null, "alias@example.com")]
        [InlineData(" ", null, "alias@example.com")]
        [InlineData("campus@example.com", null, "campus@example.com")]
        [InlineData(null, "health@example.com", "alias@example.com")]
        [InlineData(" ", "health@example.com", "alias@example.com")]
        [InlineData("campus@example.com", "health@example.com", "campus@example.com")]
        public async Task EmailLookupUsesTheVerifiedAliasWhenCampusEmailIsMissing(string campusEmail, string healthEmail, string expectedEmail)
        {
            using var database = new TestDatabase();
            var record = DirectoryPerson(0);
            record.Email.Campus = campusEmail;
            record.Email.Health = healthEmail;
            using var handler = new RosettaHandler(request =>
            {
                Assert.Equal("alias@example.com", QueryHelpers.ParseQuery(request.RequestUri.Query)["email"].ToString());
                return Task.FromResult(new[] { record });
            });
            using var http = new HttpClient(handler);
            var service = Identity(CreateClient(http), database.Context, Mock.Of<INotificationService>(MockBehavior.Strict));

            var user = await service.GetByEmail("alias@example.com");

            Assert.NotNull(user);
            Assert.Equal(record.Iam_id, user.Iam);
            Assert.Equal(expectedEmail, user.Email);
        }

        [Fact]
        public async Task BulkImportPagesPeopleAndPreservesReactivationAndNotificationsWithoutPerPersonRequests()
        {
            using var database = new TestDatabase();
            var team = new Team { Name = "Import team", Slug = "import-team" };
            database.Context.Teams.Add(team);
            var records = Enumerable.Range(0, 101).Select(DirectoryPerson).ToArray();
            for (var index = 0; index < 100; index++)
            {
                var user = LocalUser(records[index]);
                database.Context.Users.Add(user);
                if (index < 99)
                {
                    var person = TeamPerson(user, team);
                    person.Active = index != 98;
                    database.Context.People.Add(person);
                }
            }
            await database.Context.SaveChangesAsync();
            database.Context.ChangeTracker.Clear();
            // Existing users are matched by IAM even if Rosetta's login differs.
            records[98].Id.Login_id = "changed-login";
            records[99].Id.Login_id = null;
            records[100].Email.Campus = null;
            records[100].Email.Health = "health@example.com";
            var notifications = new List<(string UserId, string Action)>();
            var notificationService = new Mock<INotificationService>(MockBehavior.Strict);
            notificationService.Setup(service => service.PersonUpdated(It.IsAny<Person>(), It.IsAny<Team>(),
                    team.Slug, "Test Actor", "actor", It.IsAny<string>(), "Bulk Load from PPS code: TEST"))
                .Callback<Person, Team, string, string, string, string, string>((person, actualTeam, slug, actorName, actorId, action, notes) =>
                {
                    Assert.True(person.Id > 0);
                    Assert.Equal(team.Id, actualTeam.Id);
                    notifications.Add((person.UserId, action));
                })
                .Returns(Task.CompletedTask);
            var offsets = new List<int>();
            using var handler = new RosettaHandler(request =>
            {
                Assert.Equal(HttpMethod.Get, request.Method);
                var query = QueryHelpers.ParseQuery(request.RequestUri.Query);
                Assert.Equal("TEST", query["department"].ToString());
                Assert.Equal("100", query["limit"].ToString());
                Assert.Equal("withAffiliation", query["affiliationState"].ToString());
                Assert.False(query.ContainsKey("iamid"));
                Assert.False(query.ContainsKey("loginid"));
                var offset = int.Parse(query["offset"]);
                offsets.Add(offset);
                return Task.FromResult(records.Skip(offset).Take(100).ToArray());
            });
            using var http = new HttpClient(handler);
            var service = Identity(CreateClient(http), database.Context, notificationService.Object);

            var result = await service.BulkLoadPeople("TEST", team.Slug, "Test Actor", "actor");

            Assert.StartsWith("3 new people added to the team.", result);
            Assert.Equal(new[] { 0, 100 }, offsets);
            Assert.Equal(new[]
            {
                ("user098", PersonNotification.Actions.Reactivated),
                ("user099", PersonNotification.Actions.Added),
                ("user100", PersonNotification.Actions.Added)
            }, notifications);
            database.Context.ChangeTracker.Clear();
            Assert.Equal(101, await database.Context.People.CountAsync());
            Assert.Equal(101, await database.Context.Users.CountAsync());
            var added = await database.Context.People.SingleAsync(person => person.UserId == "user100");
            Assert.Equal("Lived", added.FirstName);
            Assert.Equal("Primary title", added.Title);
            Assert.Equal(records[100].Email.Health, added.Email);
            Assert.Equal(records[100].Email.Health, (await database.Context.Users.SingleAsync(user => user.Id == "user100")).Email);
            Assert.Equal("Primary title", (await database.Context.People.SingleAsync(person => person.UserId == "user099")).Title);
            Assert.Equal("Old", (await database.Context.People.SingleAsync(person => person.UserId == "user098")).FirstName);
            notificationService.VerifyAll();
        }

        [Fact]
        public async Task PersonCreationDoesNotSaveOrNotifyWhenRosettaHasNoMatchingUser()
        {
            using var database = new TestDatabase();
            var team = new Team { Name = "Import team", Slug = "import-team" };
            database.Context.Teams.Add(team);
            await database.Context.SaveChangesAsync();
            using var handler = new RosettaHandler(request =>
            {
                Assert.Equal("missing-user", QueryHelpers.ParseQuery(request.RequestUri.Query)["loginid"].ToString());
                return Task.FromResult(Array.Empty<RosettaPerson>());
            });
            using var http = new HttpClient(handler);
            var notifications = new Mock<INotificationService>(MockBehavior.Strict);
            var service = Identity(CreateClient(http), database.Context, notifications.Object);

            var result = await service.GetOrCreatePersonFromKerberos("missing-user", team.Id, team,
                "Test Actor", "actor", "CSV People Import");

            Assert.Null(result.Person);
            Assert.Equal(0, result.peopleCount);
            Assert.Empty(await database.Context.Users.ToListAsync());
            Assert.Empty(await database.Context.People.ToListAsync());
            Assert.Empty(await database.Context.PersonNotifications.ToListAsync());
            notifications.VerifyNoOtherCalls();
        }

        [Fact]
        public async Task BulkImportContinuesAfterAnInvalidOperationForOnePerson()
        {
            using var database = new TestDatabase();
            var team = new Team { Name = "Import team", Slug = "import-team" };
            database.Context.Teams.Add(team);
            await database.Context.SaveChangesAsync();
            var records = Enumerable.Range(0, 3).Select(DirectoryPerson).ToArray();
            using var handler = new RosettaHandler(request => Task.FromResult(records));
            using var http = new HttpClient(handler);
            var notifications = new NotificationService(database.Context, Mock.Of<ISecurityService>(MockBehavior.Strict));
            var service = new Mock<RosettaIdentityService>(CreateClient(http), database.Context, notifications) { CallBase = true };
            service.Setup(identity => identity.GetByKerberos("user001"))
                .ThrowsAsync(new InvalidOperationException("Rosetta returned ambiguous identity records."));

            var result = await service.Object.BulkLoadPeople("TEST", team.Slug, "Test Actor", "actor");

            Assert.StartsWith("2 new people added to the team.", result);
            Assert.Contains(" Kerb Id: user001 failed to save.", result);
            database.Context.ChangeTracker.Clear();
            Assert.Equal(new[] { "user000", "user002" },
                await database.Context.Users.OrderBy(user => user.Id).Select(user => user.Id).ToArrayAsync());
            var people = await database.Context.People.OrderBy(person => person.UserId).ToArrayAsync();
            Assert.Equal(new[] { "user000", "user002" }, people.Select(person => person.UserId));
            var savedNotifications = await database.Context.PersonNotifications.OrderBy(notification => notification.PersonId).ToArrayAsync();
            Assert.Equal(people.Select(person => person.Id), savedNotifications.Select(notification => notification.PersonId));
            Assert.All(savedNotifications, notification =>
            {
                Assert.Equal(PersonNotification.Actions.Added, notification.Action);
                Assert.Equal(team.Id, notification.TeamId);
                Assert.Equal("actor", notification.ActorId);
            });
            service.Verify(identity => identity.GetByKerberos("user001"), Times.Once);
        }

        [Fact]
        public async Task BulkImportPropagatesOtherPersonLookupExceptions()
        {
            using var database = new TestDatabase();
            var team = new Team { Name = "Import team", Slug = "import-team" };
            database.Context.Teams.Add(team);
            await database.Context.SaveChangesAsync();
            using var handler = new RosettaHandler(request => Task.FromResult(new[] { DirectoryPerson(0) }));
            using var http = new HttpClient(handler);
            var service = new Mock<RosettaIdentityService>(CreateClient(http), database.Context,
                Mock.Of<INotificationService>(MockBehavior.Strict)) { CallBase = true };
            var failure = new HttpRequestException("Directory lookup failed.");
            service.Setup(identity => identity.GetByKerberos("user000")).ThrowsAsync(failure);

            Assert.Same(failure, await Assert.ThrowsAsync<HttpRequestException>(() =>
                service.Object.BulkLoadPeople("TEST", team.Slug, "Test Actor", "actor")));
            Assert.Empty(await database.Context.Users.ToListAsync());
            Assert.Empty(await database.Context.People.ToListAsync());
            Assert.Empty(await database.Context.PersonNotifications.ToListAsync());
        }

        [Fact]
        public async Task BulkImportPropagatesAmbiguityWhenCachingDirectoryRecords()
        {
            using var database = new TestDatabase();
            var team = new Team { Name = "Import team", Slug = "import-team" };
            database.Context.Teams.Add(team);
            await database.Context.SaveChangesAsync();
            var records = new[] { DirectoryPerson(0), DirectoryPerson(1) };
            records[1].Id.Login_id = records[0].Id.Login_id;
            using var handler = new RosettaHandler(request => Task.FromResult(records));
            using var http = new HttpClient(handler);
            var notifications = new NotificationService(database.Context, Mock.Of<ISecurityService>(MockBehavior.Strict));
            var service = Identity(CreateClient(http), database.Context, notifications);

            var failure = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.BulkLoadPeople("TEST", team.Slug, "Test Actor", "actor"));

            Assert.Equal("Rosetta returned ambiguous identity records.", failure.Message);
            database.Context.ChangeTracker.Clear();
            Assert.Equal(records[0].Iam_id, (await database.Context.Users.SingleAsync()).Iam);
            Assert.Single(await database.Context.People.ToListAsync());
            Assert.Single(await database.Context.PersonNotifications.ToListAsync());
        }

        private static IConfiguration Configuration(Dictionary<string, string> values) =>
            new ConfigurationBuilder().AddInMemoryCollection(values).Build();

        private static Client CreateClient(HttpClient http) => new Client(http) { BaseUrl = "https://rosetta.example/api/v1" };

        private static JsonElement AssertGraphQlRequest(HttpRequestMessage request, JsonDocument body)
        {
            Assert.Equal(HttpMethod.Post, request.Method);
            Assert.Equal("/api/v1/graphql", request.RequestUri.AbsolutePath);
            Assert.Equal(string.Empty, request.RequestUri.Query);
            Assert.Equal("application/json", request.Content.Headers.ContentType.MediaType);
            var query = body.RootElement.GetProperty("query").GetString();
            foreach (var field in new[] { "iam_id", "lived_first_name", "lived_last_name", "lived_pronouns", "campus", "errors", "parameter", "message" })
                Assert.Contains(field, query);
            foreach (var field in new[] { "login_id", "employee_association", "position_title", "legal_first_name", "displayname", "birth_date", "student_association", "phone" })
                Assert.DoesNotContain(field, query);
            var filter = body.RootElement.GetProperty("variables").GetProperty("filter");
            Assert.False(filter.GetProperty("count").GetBoolean());
            Assert.Equal("all", filter.GetProperty("affiliationState").GetString());
            return filter;
        }

        private static Dictionary<string, object> GraphQlResponse(IEnumerable<RosettaPerson> records) => new Dictionary<string, object>
        {
            ["data"] = new Dictionary<string, object>
            {
                ["people"] = new Dictionary<string, object>
                {
                    ["results"] = records.Select(person => new
                    {
                        iam_id = person.Iam_id,
                        name = person.Name == null ? Array.Empty<Name>() : new[] { person.Name },
                        email = person.Email == null ? Array.Empty<Email>() : new[] { person.Email }
                    }).ToArray(),
                    ["errors"] = Array.Empty<object>()
                }
            }
        };

        private static RosettaIdentityService Identity(IClient client, ApplicationDbContext context, INotificationService notifications) =>
            new RosettaIdentityService(client, context, notifications);

        private static RosettaPerson DirectoryPerson(int index) => new RosettaPerson
        {
            Iam_id = (1000000000L + index).ToString(),
            Id = new Id { Login_id = $"user{index:D3}" },
            Name = new Name { Lived_first_name = "Lived", Lived_last_name = "Person", Lived_pronouns = "they/them" },
            Email = new Email { Campus = $"current-{index}@example.com" },
            Employee_association = new[]
            {
                new Employee_association { Position_title = "Secondary title" },
                new Employee_association { Position_title = "Primary title", Job_indicator = Employee_associationJob_indicator.P, Reports_to_iam_id = "1999999999" }
            }
        };

        private static User LocalUser(RosettaPerson person) => new User
        {
            Id = person.Id.Login_id,
            Iam = person.Iam_id,
            FirstName = "Old",
            LastName = "Name",
            Pronouns = "old pronouns",
            Email = $"old-{long.Parse(person.Iam_id) - 1000000000L}@example.com"
        };

        private static Person TeamPerson(User user, Team team) => new Person
        {
            User = user,
            Team = team,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email
        };

        private sealed class TestDatabase : IDisposable
        {
            private readonly SqliteConnection _connection = new SqliteConnection("Data Source=:memory:");
            public ApplicationDbContext Context { get; }

            public TestDatabase()
            {
                _connection.Open();
                Context = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseSqlite(_connection).Options);
                Context.Database.EnsureCreated();
            }

            public void Dispose()
            {
                Context.Dispose();
                _connection.Dispose();
            }
        }

        private sealed class RosettaHandler : HttpMessageHandler
        {
            private readonly Func<HttpRequestMessage, Task<object>> _respond;

            public RosettaHandler(Func<HttpRequestMessage, Task<RosettaPerson[]>> respond)
            {
                _respond = async request =>
                {
                    var records = await respond(request);
                    if (request.RequestUri.AbsolutePath.EndsWith("/graphql", StringComparison.Ordinal))
                        return GraphQlResponse(records);
                    return records;
                };
            }

            public RosettaHandler(object response) => _respond = request => Task.FromResult(response);

            protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) =>
                new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent(JsonSerializer.Serialize(await _respond(request)), Encoding.UTF8, "application/json")
                };
        }
    }
}
