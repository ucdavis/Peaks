using System;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;

namespace Test.Integration;

// Read-only catalog inspection for baseline regression tests, never shipped in the application.
internal static class SqlServerSchema
{
    public static async Task<JsonArray> CaptureObjectsAsync(SqlConnection connection, SqlTransaction transaction = null)
    {
        if (Convert.ToInt32(await ScalarAsync(connection, "SELECT HAS_PERMS_BY_NAME(DB_NAME(),'DATABASE','VIEW DEFINITION')", transaction)) != 1)
            throw new InvalidOperationException("VIEW DEFINITION permission is required for a complete inventory.");
        using var stream = Assembly.GetExecutingAssembly().GetManifestResourceStream("Test.catalog.sql")!;
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

    private static async Task<object> ScalarAsync(SqlConnection connection, string sql, SqlTransaction transaction)
    {
        await using var command = new SqlCommand(sql, connection, transaction);
        return await command.ExecuteScalarAsync();
    }

}
