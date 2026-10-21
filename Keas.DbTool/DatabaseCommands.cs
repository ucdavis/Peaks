using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Keas.Core.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Keas.DbTool;

public static class DatabaseCommands
{
    public const string BaselineId = "20261021183110_ProductionBaseline";
    public const string ProductVersion = "10.0.13";
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true };

    public static async Task RunAsync(string connectionString, string[] args)
    {
        var command = args[0];
        var options = new Dictionary<string, string>(StringComparer.Ordinal);
        for (var i = 1; i < args.Length; i++)
        {
            if (args[i] == "--apply") options.Add(args[i], "true");
            else if (args[i].StartsWith("--", StringComparison.Ordinal) && i + 1 < args.Length)
                options.Add(args[i], args[++i]);
            else throw new InvalidOperationException("Invalid command arguments.");
        }
        string Required(string name) => options.TryGetValue(name, out var value) && !string.IsNullOrWhiteSpace(value)
            ? value : throw new InvalidOperationException($"Missing required option {name}.");
        var allowed = command switch
        {
            "capture" => new[] { "--output" },
            "verify" => new[] { "--schema", "--server", "--database" },
            "adopt" => new[] { "--schema", "--server", "--database", "--apply" },
            "unadopt" => new[] { "--schema", "--server", "--database", "--apply" },
            "migrate" => new[] { "--server", "--database", "--to", "--apply" },
            _ => throw new InvalidOperationException("Unknown database command.")
        };
        if (options.Keys.Except(allowed).Any()) throw new InvalidOperationException("Unknown option for this command.");

        // Migration tooling never reads user secrets or starts the web application.
        if (command == "migrate")
        {
            var expectedServer = Required("--server");
            var expectedDatabase = Required("--database");
            // A missing database is allowed only for explicit creation on the named server.
            var master = new SqlConnectionStringBuilder(connectionString) { InitialCatalog = "master" };
            await using (var server = new SqlConnection(master.ConnectionString))
            {
                await server.OpenAsync();
                var identity = await IdentityAsync(server);
                if (!string.Equals(identity.Server, expectedServer, StringComparison.OrdinalIgnoreCase)
                    || !string.Equals(new SqlConnectionStringBuilder(connectionString).InitialCatalog, expectedDatabase, StringComparison.Ordinal))
                    throw new InvalidOperationException("Target identity differs from --server/--database. No migrations applied.");
            }
            if (options.GetValueOrDefault("--to") == "0")
                throw new InvalidOperationException("The production baseline cannot be rolled back. Use unadopt for adoption history, or reset a disposable sandbox.");
            var contextOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlServer(connectionString, sql => sql.UseCompatibilityLevel(140)).Options;
            await using var context = new ApplicationDbContext(contextOptions);
            if (!options.ContainsKey("--apply"))
            {
                Console.WriteLine("Target identity verified. Pass --apply to apply the reviewed migrations.");
                return;
            }
            await context.Database.MigrateAsync(options.GetValueOrDefault("--to"));
            Console.WriteLine("Migrations applied to the explicitly named target.");
            return;
        }

        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();
        var actualIdentity = await IdentityAsync(connection);
        if (command == "capture")
        {
            var objects = await CaptureObjectsAsync(connection);
            var inventory = new JsonObject
            {
                ["formatVersion"] = 1,
                ["server"] = actualIdentity.Server,
                ["database"] = actualIdentity.Database,
                ["capturedAtUtc"] = DateTimeOffset.UtcNow.ToString("O"),
                ["objects"] = objects
            };
            await File.WriteAllTextAsync(Required("--output"), inventory.ToJsonString(JsonOptions) + "\n");
            Console.WriteLine($"Captured {objects.Count} schema objects. No application data exported.");
            return;
        }
        if (!string.Equals(actualIdentity.Server, Required("--server"), StringComparison.OrdinalIgnoreCase)
            || !string.Equals(actualIdentity.Database, Required("--database"), StringComparison.Ordinal))
            throw new InvalidOperationException("Target identity differs from --server/--database. No changes made.");
        var expected = JsonNode.Parse(await File.ReadAllTextAsync(Required("--schema")))?.AsObject()
            ?? throw new InvalidOperationException("Invalid inventory file.");
        if (expected["formatVersion"]?.GetValue<int>() != 1
            || !string.Equals(expected["server"]?.GetValue<string>(), actualIdentity.Server, StringComparison.OrdinalIgnoreCase)
            || expected["database"]?.GetValue<string>() != actualIdentity.Database)
            throw new InvalidOperationException("Inventory identity differs from target. Use an approved inventory for this database.");

        await using var transaction = (SqlTransaction)await connection.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
        // Shares EF SQL Server's lock resource so adoption cannot race a normal EF update.
        await ExecuteAsync(connection, "DECLARE @r int; EXEC @r=sys.sp_getapplock @Resource=N'__EFMigrationsLock', @LockOwner='Transaction', @LockMode='Exclusive', @LockTimeout=10000; IF @r<0 THROW 51000, 'Cannot acquire migration lock.', 1;", transaction);
        var actual = await CaptureObjectsAsync(connection, transaction);
        var differences = Differences(expected["objects"]!.AsArray(), actual);
        if (differences.Count != 0)
            throw new InvalidOperationException("Schema differs from approved inventory:\n" + string.Join("\n", differences.Take(30)));
        var historyExists = Convert.ToInt32(await ScalarAsync(connection,
            "SELECT COUNT(*) FROM sys.tables WHERE object_id=OBJECT_ID(N'dbo.__EFMigrationsHistory')", transaction)) == 1;
        if (historyExists) await ValidateHistoryAsync(connection, transaction);
        if (command == "verify")
        {
            await transaction.RollbackAsync();
            Console.WriteLine($"Schema matches {actual.Count} inventoried objects; history structure is valid.");
            return;
        }
        var history = new List<(string Id, string Version)>();
        if (historyExists)
        {
            await using var query = new SqlCommand("SELECT MigrationId, ProductVersion FROM dbo.__EFMigrationsHistory ORDER BY MigrationId", connection, transaction);
            await using var reader = await query.ExecuteReaderAsync();
            while (await reader.ReadAsync()) history.Add((reader.GetString(0), reader.GetString(1)));
        }
        if (history.Any(h => h.Id != BaselineId || h.Version != ProductVersion))
            throw new InvalidOperationException("Conflicting or later migration history exists. Adoption/unadoption is refused.");
        if (!options.ContainsKey("--apply"))
        {
            await transaction.RollbackAsync();
            Console.WriteLine($"{command} checks passed. Pass --apply to change migration history only.");
            return;
        }
        if (command == "adopt")
        {
            if (!historyExists)
                await ExecuteAsync(connection, "CREATE TABLE dbo.__EFMigrationsHistory (MigrationId nvarchar(150) NOT NULL, ProductVersion nvarchar(32) NOT NULL, CONSTRAINT PK___EFMigrationsHistory PRIMARY KEY (MigrationId));", transaction);
            if (history.Count == 0)
            {
                await using var insert = new SqlCommand("INSERT dbo.__EFMigrationsHistory(MigrationId,ProductVersion) VALUES (@id,@version)", connection, transaction);
                insert.Parameters.AddWithValue("@id", BaselineId);
                insert.Parameters.AddWithValue("@version", ProductVersion);
                await insert.ExecuteNonQueryAsync();
            }
        }
        else if (historyExists)
        {
            // Keep even an empty history table: its pre-adoption ownership cannot be inferred later.
            await using var delete = new SqlCommand("DELETE FROM dbo.__EFMigrationsHistory WHERE MigrationId=@id", connection, transaction);
            delete.Parameters.AddWithValue("@id", BaselineId);
            await delete.ExecuteNonQueryAsync();
        }
        await transaction.CommitAsync();
        Console.WriteLine($"{command} completed. Only migration history changed; application objects and rows were untouched.");
    }

    public static async Task<(string Server, string Database)> IdentityAsync(SqlConnection connection)
    {
        await using var command = new SqlCommand("SELECT CONVERT(nvarchar(256),SERVERPROPERTY('ServerName')), DB_NAME()", connection);
        await using var reader = await command.ExecuteReaderAsync();
        await reader.ReadAsync();
        return (reader.GetString(0), reader.GetString(1));
    }

    public static async Task<JsonArray> CaptureObjectsAsync(SqlConnection connection, SqlTransaction? transaction = null)
    {
        if (Convert.ToInt32(await ScalarAsync(connection, "SELECT HAS_PERMS_BY_NAME(DB_NAME(),'DATABASE','VIEW DEFINITION')", transaction)) != 1)
            throw new InvalidOperationException("VIEW DEFINITION permission is required for a complete inventory.");
        using var stream = Assembly.GetExecutingAssembly().GetManifestResourceStream("Keas.DbTool.catalog.sql")!;
        using var text = new StreamReader(stream);
        await using var command = new SqlCommand(await text.ReadToEndAsync(), connection, transaction) { CommandTimeout = 30 };
        await using var reader = await command.ExecuteReaderAsync();
        var json = new StringBuilder();
        while (await reader.ReadAsync()) json.Append(reader.GetString(0));
        var result = JsonNode.Parse(json.Length == 0 ? "[]" : json.ToString())!.AsArray();
        if (result.Any(o => o!["type"]!.GetValue<string>().Trim() != "U" && o["definition"] == null))
            throw new InvalidOperationException("An encrypted or unreadable module prevents complete schema verification.");
        return result;
    }

    public static List<string> Differences(JsonArray expected, JsonArray actual)
    {
        // SQL Server and source checkouts can use different line endings for the same module text.
        static JsonArray Normalize(JsonArray source)
        {
            var copy = (JsonArray)source.DeepClone();
            foreach (var node in copy)
                if (node!["definition"] is JsonValue definition)
                    node["definition"] = definition.GetValue<string>().Replace("\r\n", "\n");
            return copy;
        }
        static string Key(JsonNode? node) => $"{node!["schema"]}.{node["name"]}";
        var left = Normalize(expected).ToDictionary(Key);
        var right = Normalize(actual).ToDictionary(Key);
        var differences = new List<string>();
        foreach (var key in left.Keys.Union(right.Keys).OrderBy(k => k, StringComparer.Ordinal))
        {
            if (!left.TryGetValue(key, out var a)) differences.Add($"Unexpected object {key}");
            else if (!right.TryGetValue(key, out var b)) differences.Add($"Missing object {key}");
            else if (!JsonNode.DeepEquals(a, b))
            {
                foreach (var field in a!.AsObject().Select(p => p.Key).Union(b!.AsObject().Select(p => p.Key)))
                    if (!JsonNode.DeepEquals(a[field], b[field])) differences.Add($"Changed {key}.{field}");
            }
        }
        return differences;
    }

    private static async Task ValidateHistoryAsync(SqlConnection connection, SqlTransaction transaction)
    {
        const string sql = """
            SELECT CASE WHEN
            (SELECT COUNT(*) FROM sys.columns WHERE object_id=OBJECT_ID(N'dbo.__EFMigrationsHistory'))=2
            AND EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID(N'dbo.__EFMigrationsHistory') AND name='MigrationId' AND TYPE_NAME(user_type_id)='nvarchar' AND max_length=300 AND is_nullable=0 AND is_identity=0 AND is_computed=0)
            AND EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID(N'dbo.__EFMigrationsHistory') AND name='ProductVersion' AND TYPE_NAME(user_type_id)='nvarchar' AND max_length=64 AND is_nullable=0 AND is_identity=0 AND is_computed=0)
            AND EXISTS (SELECT 1 FROM sys.indexes i JOIN sys.index_columns ic ON i.object_id=ic.object_id AND i.index_id=ic.index_id WHERE i.object_id=OBJECT_ID(N'dbo.__EFMigrationsHistory') AND i.is_primary_key=1 AND ic.key_ordinal=1 AND COL_NAME(ic.object_id,ic.column_id)='MigrationId' AND NOT EXISTS (SELECT 1 FROM sys.index_columns x WHERE x.object_id=i.object_id AND x.index_id=i.index_id AND x.key_ordinal>1))
            AND NOT EXISTS (SELECT 1 FROM sys.triggers WHERE parent_id=OBJECT_ID(N'dbo.__EFMigrationsHistory'))
            AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE parent_object_id=OBJECT_ID(N'dbo.__EFMigrationsHistory') OR referenced_object_id=OBJECT_ID(N'dbo.__EFMigrationsHistory'))
            THEN 1 ELSE 0 END
            """;
        if (Convert.ToInt32(await ScalarAsync(connection, sql, transaction)) != 1)
            throw new InvalidOperationException("Existing migration history has an unexpected shape or side effects.");
    }

    private static async Task<object?> ScalarAsync(SqlConnection connection, string sql, SqlTransaction? transaction)
    {
        await using var command = new SqlCommand(sql, connection, transaction);
        return await command.ExecuteScalarAsync();
    }

    private static async Task ExecuteAsync(SqlConnection connection, string sql, SqlTransaction transaction)
    {
        await using var command = new SqlCommand(sql, connection, transaction);
        await command.ExecuteNonQueryAsync();
    }
}
