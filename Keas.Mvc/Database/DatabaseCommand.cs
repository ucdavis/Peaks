using System;
using System.Threading.Tasks;

namespace Keas.Mvc.Database;

public static class DatabaseCommand
{
    public static async Task<int> RunAsync(string[] args)
    {
        if (args.Length == 0 || (args[0] != "migrate" && args[0] != "seed-sandbox"))
        {
            Console.Error.WriteLine("Usage: Keas.Mvc database <migrate|seed-sandbox> [options]. See docs/database/README.md.");
            return 2;
        }
        try
        {
            var connection = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");
            if (string.IsNullOrWhiteSpace(connection))
                throw new InvalidOperationException("Set ConnectionStrings__DefaultConnection to the intended SQL Server target.");
            if (args.Length == 1 && args[0] == "seed-sandbox")
                await SandboxSeed.RunAsync(connection);
            else
                await DatabaseCommands.RunAsync(connection, args);
            return 0;
        }
        catch (Exception error)
        {
            // SQL client exceptions may include target or query details. Never print connection strings.
            Console.Error.WriteLine(error is Microsoft.Data.SqlClient.SqlException sql
                ? sql.Number == 51000 ? sql.Message : $"SQL operation failed (number {sql.Number}). No successful operation is claimed."
                : error.Message);
            return 1;
        }
    }
}
