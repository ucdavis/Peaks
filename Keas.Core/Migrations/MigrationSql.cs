using System;
using System.IO;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Keas.Core.Migrations
{
    internal static class MigrationSql
    {
        internal static void Apply(MigrationBuilder builder, string resource, bool module = false)
        {
            using var stream = typeof(MigrationSql).Assembly.GetManifestResourceStream("Keas.Core.Migrations.Sql." + resource)
                ?? throw new InvalidOperationException("Missing versioned migration SQL: " + resource);
            using var reader = new StreamReader(stream);
            var sql = reader.ReadToEnd();
            if (module)
            {
                // CREATE VIEW/PROCEDURE needs its own batch, including inside EF idempotent scripts.
                builder.Sql("SET ANSI_NULLS ON; SET QUOTED_IDENTIFIER ON; EXEC(N'" + sql.Replace("'", "''") + "');");
                return;
            }
            // These reviewed resources contain only standalone GO batch separators.
            foreach (var batch in Regex.Split(sql, @"^\s*GO\s*$", RegexOptions.Multiline | RegexOptions.IgnoreCase))
                if (!string.IsNullOrWhiteSpace(batch)) builder.Sql(batch);
        }
    }
}
