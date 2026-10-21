using System.Collections.Generic;
using System.Linq;
using System;
using System.Threading.Tasks;
using Keas.Core.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Database;

public static class DatabaseCommands
{
    public const string BaselineId = "20261021183110_ProductionBaseline";

    public static async Task RunAsync(string connectionString, string[] args)
    {
        if (args.Length == 0 || args[0] != "migrate")
            throw new InvalidOperationException("Unknown database command. Use migrate; one-time baseline adoption is a separate utility.");
        var options = new Dictionary<string, string>(StringComparer.Ordinal);
        for (var i = 1; i < args.Length; i++)
        {
            if (args[i] is "--apply" or "--create-database") options.Add(args[i], "true");
            else if (args[i].StartsWith("--", StringComparison.Ordinal) && i + 1 < args.Length)
                options.Add(args[i], args[++i]);
            else throw new InvalidOperationException("Invalid command arguments.");
        }
        string Required(string name) => options.TryGetValue(name, out var value) && !string.IsNullOrWhiteSpace(value)
            ? value : throw new InvalidOperationException($"Missing required option {name}.");
        var allowed = new[] { "--server", "--database", "--to", "--apply", "--create-database" };
        if (options.Keys.Except(allowed).Any()) throw new InvalidOperationException("Unknown option for this command.");

        // Migration tooling never reads user secrets or starts the web application.
        var expectedServer = Required("--server");
        var expectedDatabase = Required("--database");
        var target = new SqlConnectionStringBuilder(connectionString);
        if (!string.Equals(target.InitialCatalog, expectedDatabase, StringComparison.Ordinal))
            throw new InvalidOperationException("Target identity differs from --server/--database. No migrations applied.");
        // Existing databases need no master login. Creation is an explicit, separate path.
        var createDatabase = options.ContainsKey("--create-database");
        if (createDatabase) target.InitialCatalog = "master";
        await using (var targetConnection = new SqlConnection(target.ConnectionString))
        {
            await targetConnection.OpenAsync();
            var identity = await IdentityAsync(targetConnection);
            if (!string.Equals(identity.Server, expectedServer, StringComparison.OrdinalIgnoreCase)
                || !string.Equals(identity.Database, createDatabase ? "master" : expectedDatabase, StringComparison.Ordinal))
                throw new InvalidOperationException("Target identity differs from --server/--database. No migrations applied.");
        }
        if (options.GetValueOrDefault("--to") == "0")
            throw new InvalidOperationException("The production baseline cannot be rolled back. Use the separate baseline-adoption utility for adoption history, or reset a disposable sandbox.");
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
    }

    public static async Task<(string Server, string Database)> IdentityAsync(SqlConnection connection)
    {
        await using var command = new SqlCommand("SELECT CONVERT(nvarchar(256),SERVERPROPERTY('ServerName')), DB_NAME()", connection);
        await using var reader = await command.ExecuteReaderAsync();
        await reader.ReadAsync();
        return (reader.GetString(0), reader.GetString(1));
    }

}
