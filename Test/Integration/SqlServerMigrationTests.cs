using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.DbTool;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Xunit;

namespace Test.Integration
{
    public sealed class SqlServerFactAttribute : FactAttribute
    {
        public SqlServerFactAttribute()
        {
            if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("PEAKS_TEST_SQL")))
                Skip = "Set PEAKS_TEST_SQL to a disposable local SQL Server administrator connection.";
        }
    }

    public class SqlServerMigrationTests
    {
        [Fact]
        public void SnapshotMatchesUnchangedApplicationModel()
        {
            using var context = new ApplicationDbContextFactory().CreateDbContext(Array.Empty<string>());
            Assert.False(context.Database.HasPendingModelChanges());
            Assert.Equal(DatabaseCommands.BaselineId, context.Database.GetMigrations().First());
        }

        [Fact]
        public async Task DesignTimeContextRequiresAnExplicitConnection()
        {
            await using var context = new ApplicationDbContextFactory().CreateDbContext(Array.Empty<string>());
            Assert.True(context.Database.IsSqlServer());
            Assert.Null(context.Database.GetConnectionString());
            await Assert.ThrowsAsync<InvalidOperationException>(() => context.Database.OpenConnectionAsync());
        }

        [SqlServerFact]
        public async Task FreshCreationMatchesProductionSchemaAndCannotDropBaseline()
        {
            await using var db = await SandboxDatabase.Create();
            await db.Context.Database.MigrateAsync(DatabaseCommands.BaselineId);
            var expected = JsonNode.Parse(await File.ReadAllTextAsync(InventoryPath("production")))["objects"].AsArray();
            foreach (var backup in expected.Where(o => o["name"].GetValue<string>().EndsWith("_20250421_bak", StringComparison.Ordinal)).ToArray())
                expected.Remove(backup);
            var indexes = expected.Single(o => o["name"].GetValue<string>() == "KeySerialAssignments")["indexes"].AsArray();
            indexes.Remove(indexes.Single(i => i["name"].GetValue<string>() == "nci_msft_1_KeySerialAssignments_E1E481049847DD46716CAB3B3F5C9B0E"));
            Assert.Empty(DatabaseCommands.Differences(expected, await DatabaseCommands.CaptureObjectsAsync(db.Connection)));
            Assert.Equal(41, expected.Count(o => o["type"].GetValue<string>().Trim() == "U"));
            await Assert.ThrowsAsync<InvalidOperationException>(() => db.Context.GetService<IMigrator>().MigrateAsync("0"));
            Assert.Equal(41, Convert.ToInt32(await db.Scalar("SELECT COUNT(*) FROM sys.tables WHERE name<>'__EFMigrationsHistory'")));
        }

        [SqlServerFact]
        public async Task IdempotentSqlScriptCreatesSchemaAndCanBeRepeated()
        {
            await using var db = await SandboxDatabase.Create();
            var script = db.Context.GetService<IMigrator>().GenerateScript(toMigration: DatabaseCommands.BaselineId, options: MigrationsSqlGenerationOptions.Idempotent);
            for (var run = 0; run < 2; run++)
            {
                foreach (var batch in SqlBatches(script))
                    if (!string.IsNullOrWhiteSpace(batch)) await db.Execute(batch);
                Assert.Equal(1, Convert.ToInt32(await db.Scalar("SELECT COUNT(*) FROM dbo.__EFMigrationsHistory")));
                Assert.Equal(41, Convert.ToInt32(await db.Scalar("SELECT COUNT(*) FROM sys.tables WHERE name<>'__EFMigrationsHistory'")));
            }
        }

        [SqlServerFact]
        public async Task AdoptionPreservesRowsAndSchemaForBothEnvironmentShapes()
        {
            foreach (var testShape in new[] { false, true })
            {
                await using var db = await SandboxDatabase.Create();
                await db.Context.Database.MigrateAsync(DatabaseCommands.BaselineId);
                if (testShape)
                {
                    await db.Execute("ALTER TABLE dbo.DeptSpace DROP COLUMN Room_Share_Station_Count, Room_Name; ALTER TABLE dbo.FISOrgs ALTER COLUMN OrgCode nvarchar(4) NOT NULL; DROP INDEX IX_Notifications_Pending_UserId ON dbo.Notifications; DROP INDEX IX_Notifications_Team_DateCreated ON dbo.Notifications;");
                    var expectedTest = JsonNode.Parse(await File.ReadAllTextAsync(InventoryPath("test")))["objects"].AsArray();
                    foreach (var table in expectedTest)
                        foreach (var foreignKey in table["foreignKeys"]?.AsArray() ?? new JsonArray())
                            if (foreignKey["is_not_trusted"].GetValue<bool>())
                                await db.Execute($"ALTER TABLE [dbo].[{table["name"]}] NOCHECK CONSTRAINT [{foreignKey["name"]}]; ALTER TABLE [dbo].[{table["name"]}] CHECK CONSTRAINT [{foreignKey["name"]}];");
                    Assert.Empty(DatabaseCommands.Differences(expectedTest, await DatabaseCommands.CaptureObjectsAsync(db.Connection)));
                }
                else
                    await db.Execute("CREATE TABLE dbo.Bldg_20250421_bak (Marker int NOT NULL); INSERT dbo.Bldg_20250421_bak VALUES (42);");
                await db.Execute("""
                    INSERT dbo.Teams (Name,Slug) VALUES ('Regression','regression');
                    DECLARE @team int = SCOPE_IDENTITY();
                    INSERT dbo.Users (Id,FirstName,LastName,Email) VALUES ('fixture','Fixture','User','fixture@example.test');
                    INSERT dbo.People (FirstName,LastName,Email,TeamId,Active) VALUES
                        ('Active','Person','active@example.test',@team,1),
                        ('Inactive','Person','inactive@example.test',@team,0);
                    INSERT dbo.Documents (Name,TeamId,PersonId,EnvelopeId,TemplateId,Status,CreatedAt,Active)
                        SELECT FirstName,@team,Id,'fixture','fixture','created',SYSUTCDATETIME(),1 FROM dbo.People;
                    INSERT dbo.PersonNotifications (TeamId,PersonId,PersonName,PersonEmail,NotificationEmail,Action,ActorId,ActorName,Pending,ActionDate)
                        VALUES (@team,2147483647,'Historical person','past@example.test','','Added','fixture','Fixture User',1,SYSUTCDATETIME());
                    INSERT dbo.Histories (Description,ActorId,ActedDate) VALUES ('Fixture history','fixture',SYSUTCDATETIME());
                    DECLARE @history int = SCOPE_IDENTITY();
                    INSERT dbo.Notifications (TeamId,UserId,HistoryId,Pending,DateTimeCreated) VALUES (@team,'fixture',@history,1,SYSUTCDATETIME());
                    INSERT dbo.TeamPpsDepartments (TeamId,PpsDepartmentCode,DepartmentName) VALUES (@team,'ABCDEF','Fixture department');
                    """);
                await db.Execute("DROP TABLE dbo.__EFMigrationsHistory;");
                var inventory = await db.Capture();
                var before = await db.AllRows();
                await db.Command("adopt", inventory); // dry run
                Assert.Equal(0, Convert.ToInt32(await db.Scalar("SELECT COUNT(*) FROM sys.tables WHERE name='__EFMigrationsHistory'")));
                await db.Command("adopt", inventory, "--apply");
                await db.Command("adopt", inventory, "--apply");
                await db.Context.Database.MigrateAsync(DatabaseCommands.BaselineId);
                Assert.Equal(before, await db.AllRows());
                Assert.Empty(DatabaseCommands.Differences(JsonNode.Parse(await File.ReadAllTextAsync(inventory))["objects"].AsArray(), await DatabaseCommands.CaptureObjectsAsync(db.Connection)));
                Assert.Equal(1, Convert.ToInt32(await db.Scalar("SELECT COUNT(*) FROM dbo.__EFMigrationsHistory")));
                await db.Execute("INSERT dbo.__EFMigrationsHistory VALUES ('20990101000000_Future', '10.0.13')");
                await Assert.ThrowsAsync<InvalidOperationException>(() => db.Command("unadopt", inventory, "--apply"));
                await db.Execute("DELETE dbo.__EFMigrationsHistory WHERE MigrationId='20990101000000_Future'");
                await db.Command("unadopt", inventory, "--apply");
                await db.Command("unadopt", inventory, "--apply");
                Assert.Equal(0, Convert.ToInt32(await db.Scalar("SELECT COUNT(*) FROM dbo.__EFMigrationsHistory")));
                Assert.Equal(before, await db.AllRows());
                await db.Command("adopt", inventory, "--apply");
            }
        }

        [SqlServerFact]
        public async Task CurrentSchemaPreservesDocumentVisibilityAndNotificationTeamLoading()
        {
            await using var db = await SandboxDatabase.Create();
            await db.Context.Database.MigrateAsync();
            await SeedBehavior(db.Context);
            await AssertBehavior(db.Context);
        }

        [SqlServerFact]
        public async Task CreationRefusesAnExistingUnregisteredDatabase()
        {
            await using var db = await SandboxDatabase.Create();
            await db.Execute("CREATE TABLE dbo.KeepMe (Id int); INSERT dbo.KeepMe VALUES (123)");
            var error = await Assert.ThrowsAsync<SqlException>(() => db.Context.Database.MigrateAsync(DatabaseCommands.BaselineId));
            Assert.Contains("Verify and adopt", error.Message);
            Assert.Equal(123, Convert.ToInt32(await db.Scalar("SELECT Id FROM dbo.KeepMe")));
            Assert.Equal(0, Convert.ToInt32(await db.Scalar("SELECT COUNT(*) FROM sys.tables WHERE name='People'")));
        }

        [SqlServerFact]
        public async Task AdoptionRejectsDriftIdentityAndHistoryConflicts()
        {
            await using var db = await SandboxDatabase.Create();
            await db.Context.Database.MigrateAsync(DatabaseCommands.BaselineId);
            var inventory = await db.Capture();
            await Assert.ThrowsAsync<InvalidOperationException>(() => DatabaseCommands.RunAsync(db.ConnectionString,
                new[] { "adopt", "--schema", inventory, "--server", "wrong-server", "--database", db.Name, "--apply" }));
            var wrong = JsonNode.Parse(await File.ReadAllTextAsync(inventory));
            wrong["database"] = "WrongDatabase";
            var wrongPath = Path.Combine(db.Directory, "wrong.json");
            await File.WriteAllTextAsync(wrongPath, wrong.ToJsonString());
            await Assert.ThrowsAsync<InvalidOperationException>(() => db.Command("adopt", wrongPath, "--apply"));

            foreach (var change in new[]
            {
                ("ALTER TABLE dbo.Teams ADD Unexpected int NULL", "ALTER TABLE dbo.Teams DROP COLUMN Unexpected"),
                ("DROP INDEX IX_Notifications_Team_DateCreated ON dbo.Notifications; CREATE INDEX IX_Notifications_Team_DateCreated ON dbo.Notifications(TeamId,DateTimeCreated DESC) INCLUDE(Details)",
                 "DROP INDEX IX_Notifications_Team_DateCreated ON dbo.Notifications; CREATE INDEX IX_Notifications_Team_DateCreated ON dbo.Notifications(TeamId,DateTimeCreated DESC) INCLUDE(DateTimeSent,Details,HistoryId,NeedsAccept)"),
                ("ALTER TABLE dbo.Documents NOCHECK CONSTRAINT FK_Documents_People_PersonId", "ALTER TABLE dbo.Documents WITH CHECK CHECK CONSTRAINT FK_Documents_People_PersonId")
            })
            {
                await db.Execute(change.Item1);
                await Assert.ThrowsAsync<InvalidOperationException>(() => db.Command("adopt", inventory, "--apply"));
                await db.Execute(change.Item2);
                await db.Command("verify", inventory);
            }
            await db.Execute("UPDATE dbo.__EFMigrationsHistory SET ProductVersion='conflict'");
            await Assert.ThrowsAsync<InvalidOperationException>(() => db.Command("adopt", inventory, "--apply"));
            Assert.Equal("conflict", await db.Scalar("SELECT ProductVersion FROM dbo.__EFMigrationsHistory"));
        }

        [SqlServerFact]
        public async Task AdoptionRejectsChangedModulesAndUnsafeHistory()
        {
            await using var db = await SandboxDatabase.Create();
            await db.Context.Database.MigrateAsync(DatabaseCommands.BaselineId);
            var inventory = await db.Capture();
            await db.Execute("ALTER VIEW dbo.vRooms AS SELECT 1 AS Unexpected");
            var error = await Assert.ThrowsAsync<InvalidOperationException>(() => db.Command("adopt", inventory, "--apply"));
            Assert.Contains("vRooms", error.Message);
            // An operator inventory containing the altered view still cannot authorize unsafe history DML.
            await db.Execute("CREATE TRIGGER HistorySideEffect ON dbo.__EFMigrationsHistory AFTER INSERT AS BEGIN UPDATE dbo.Teams SET Name='Unexpected'; END");
            inventory = await db.Capture();
            error = await Assert.ThrowsAsync<InvalidOperationException>(() => db.Command("adopt", inventory, "--apply"));
            Assert.Contains("unexpected shape or side effects", error.Message);
        }

        [SqlServerFact]
        public async Task InventoryRejectsIncompleteMetadataPermissions()
        {
            await using var db = await SandboxDatabase.Create();
            await db.Execute("CREATE USER Limited WITHOUT LOGIN; EXECUTE AS USER='Limited';");
            try { await Assert.ThrowsAsync<InvalidOperationException>(() => DatabaseCommands.CaptureObjectsAsync(db.Connection)); }
            finally { await db.Execute("REVERT"); }
        }

        private static async Task SeedBehavior(ApplicationDbContext context)
        {
            var team = new Team { Name = "Regression", Slug = "regression" };
            var user = new User { Id = "fixture", FirstName = "Fixture", LastName = "User", Email = "fixture@example.test" };
            var active = new Person { FirstName = "Active", LastName = "Person", Email = "active@example.test", Team = team };
            var inactive = new Person { FirstName = "Inactive", LastName = "Person", Email = "inactive@example.test", Team = team, Active = false };
            context.AddRange(team, user, active, inactive);
            foreach (var person in new[] { active, inactive })
                context.Documents.Add(new Document { Name = person.FirstName, Team = team, Person = person, EnvelopeId = "fixture", TemplateId = "fixture", Status = "created", CreatedAt = DateTime.UtcNow });
            context.PersonNotifications.Add(new PersonNotification { Team = team, PersonId = int.MaxValue, PersonName = "Historical person", PersonEmail = "past@example.test", NotificationEmail = "", Action = "Added", ActorId = "fixture", ActorName = "Fixture User" });
            context.Notifications.Add(new Notification { Team = team, User = user, History = new History { Description = "Fixture history", Actor = user } });
            context.TeamPpsDepartments.Add(new TeamPpsDepartment { Team = team, PpsDepartmentCode = "ABCDEF", DepartmentName = "Fixture department" });
            await context.SaveChangesAsync();
            context.ChangeTracker.Clear();
        }

        private static async Task AssertBehavior(ApplicationDbContext context)
        {
            context.ChangeTracker.Clear();
            var visible = await context.Documents.AsNoTracking().Include(d => d.Person).ToListAsync();
            Assert.Single(visible);
            Assert.Equal("Active", visible[0].Person.FirstName);
            Assert.Equal(2, await context.Documents.IgnoreQueryFilters().CountAsync());
            var orphan = await context.PersonNotifications.Include(n => n.Team).SingleAsync();
            Assert.Equal(int.MaxValue, orphan.PersonId);
            Assert.Equal("Historical person", orphan.PersonName);
            Assert.Equal("Regression", orphan.Team.Name);
            Assert.False(orphan.SendEmail);
            Assert.Equal("Regression", (await context.Notifications.Include(n => n.Team).SingleAsync()).Team.Name);
            Assert.Equal("ABCDEF", (await context.Teams.Include(t => t.PpsDepartments).SingleAsync()).PpsDepartments.Single().PpsDepartmentCode);
        }

        private static string InventoryPath(string environment)
        {
            var directory = new DirectoryInfo(AppContext.BaseDirectory);
            while (directory != null && !File.Exists(Path.Combine(directory.FullName, "Keas.sln"))) directory = directory.Parent;
            return Path.Combine(directory?.FullName ?? throw new InvalidOperationException("Cannot locate repository inventories."), "docs", "database", environment + "-schema-2026-10-21.json");
        }

        // Execute EF's emitted SQL batches while leaving GO inside quoted module definitions intact.
        private static IEnumerable<string> SqlBatches(string script)
        {
            var batch = new System.Text.StringBuilder();
            char quote = '\0';
            var commentDepth = 0;
            using var reader = new StringReader(script);
            string line;
            while ((line = reader.ReadLine()) != null)
            {
                if (quote == '\0' && commentDepth == 0 && Regex.IsMatch(line, @"^\s*GO\s*$", RegexOptions.IgnoreCase))
                {
                    yield return batch.ToString();
                    batch.Clear();
                    continue;
                }
                batch.AppendLine(line);
                for (var i = 0; i < line.Length; i++)
                {
                    var c = line[i];
                    var next = i + 1 < line.Length ? line[i + 1] : '\0';
                    if (quote != '\0')
                    {
                        if (c == quote) { if (next == quote) i++; else quote = '\0'; }
                    }
                    else if (c == '/' && next == '*') { commentDepth++; i++; }
                    else if (commentDepth > 0) { if (c == '*' && next == '/') { commentDepth--; i++; } }
                    else if (c == '-' && next == '-') break;
                    else if (c == '\'' || c == '"') quote = c;
                    else if (c == '[') quote = ']';
                }
            }
            if (batch.Length > 0) yield return batch.ToString();
        }

        private sealed class SandboxDatabase : IAsyncDisposable
        {
            private string Master { get; }
            public string Name { get; } = "PeaksMigrationTest_" + Guid.NewGuid().ToString("N");
            public string Directory { get; } = Path.Combine(Path.GetTempPath(), "peaks-test-" + Guid.NewGuid().ToString("N"));
            public string ConnectionString { get; private set; }
            public SqlConnection Connection { get; private set; }
            public ApplicationDbContext Context { get; private set; }
            private SandboxDatabase(string master) { Master = master; System.IO.Directory.CreateDirectory(Directory); }
            public static async Task<SandboxDatabase> Create()
            {
                var builder = new SqlConnectionStringBuilder(Environment.GetEnvironmentVariable("PEAKS_TEST_SQL"));
                var host = builder.DataSource.Split(',')[0];
                if (host != "127.0.0.1" && host != "localhost" && host != "sql")
                    throw new InvalidOperationException("Migration tests only allow disposable loopback/Compose SQL Server.");
                builder.InitialCatalog = "master";
                var db = new SandboxDatabase(builder.ConnectionString);
                await using (var master = new SqlConnection(db.Master))
                {
                    await master.OpenAsync();
                    await using var create = new SqlCommand($"CREATE DATABASE [{db.Name}] COLLATE SQL_Latin1_General_CP1_CI_AS", master);
                    await create.ExecuteNonQueryAsync();
                }
                builder.InitialCatalog = db.Name;
                db.ConnectionString = builder.ConnectionString;
                db.Connection = new SqlConnection(db.ConnectionString);
                await db.Connection.OpenAsync();
                db.Context = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
                    .UseSqlServer(builder.ConnectionString, sql => sql.UseCompatibilityLevel(140)).Options);
                return db;
            }
            public async Task Execute(string sql) { await using var cmd = new SqlCommand(sql, Connection); await cmd.ExecuteNonQueryAsync(); }
            public async Task<object> Scalar(string sql) { await using var cmd = new SqlCommand(sql, Connection); return await cmd.ExecuteScalarAsync(); }
            public async Task<string> Capture()
            {
                var path = Path.Combine(Directory, "inventory.json");
                await DatabaseCommands.RunAsync(ConnectionString, new[] { "capture", "--output", path });
                return path;
            }
            public async Task Command(string command, string inventory, params string[] extra)
            {
                var identity = await DatabaseCommands.IdentityAsync(Connection);
                await DatabaseCommands.RunAsync(ConnectionString,
                    new[] { command, "--schema", inventory, "--server", identity.Server, "--database", Name }.Concat(extra).ToArray());
            }
            public async Task<string[]> AllRows()
            {
                var objects = await DatabaseCommands.CaptureObjectsAsync(Connection);
                var rows = new List<string>();
                foreach (var table in objects.Where(o => o["type"].GetValue<string>().Trim() == "U"))
                    rows.Add(table["name"] + ":" + await Scalar("SELECT * FROM [dbo].[" + table["name"] + "] FOR JSON PATH, INCLUDE_NULL_VALUES"));
                return rows.ToArray();
            }
            public async ValueTask DisposeAsync()
            {
                await Context.DisposeAsync();
                await Connection.DisposeAsync();
                SqlConnection.ClearAllPools();
                await using var master = new SqlConnection(Master);
                await master.OpenAsync();
                await using var drop = new SqlCommand($"ALTER DATABASE [{Name}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [{Name}];", master);
                await drop.ExecuteNonQueryAsync();
                System.IO.Directory.Delete(Directory, true);
            }
        }
    }
}
