using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Keas.Core.Migrations
{
    // The snapshot records the existing application model. This initial migration
    // creates the physical production schema, including unmapped objects.
    public partial class ProductionBaseline : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            if (ActiveProvider != "Microsoft.EntityFrameworkCore.SqlServer")
                throw new InvalidOperationException("The production baseline requires SQL Server. SQLite development and tests keep their existing EnsureCreated workflow.");
            migrationBuilder.Sql("""
                IF EXISTS (SELECT 1 FROM sys.objects WHERE is_ms_shipped=0
                    AND type IN ('U','V','P','FN','IF','TF','TR','SO')
                    AND NOT (schema_id=SCHEMA_ID('dbo') AND name='__EFMigrationsHistory'))
                    THROW 51000, 'Existing schema detected. Do not run the creation baseline here. Verify and adopt with the separate baseline-adoption utility and the approved environment inventory.', 1;
                IF CONVERT(nvarchar(128),DATABASEPROPERTYEX(DB_NAME(),'Collation')) <> N'SQL_Latin1_General_CP1_CI_AS'
                    THROW 51000, 'Fresh Peaks databases require SQL_Latin1_General_CP1_CI_AS collation.', 1;
                """);
            MigrationSql.Apply(migrationBuilder, "ProductionBaseline.Tables.sql");
            foreach (var name in new[] { "vRooms", "vSpaces", "vSpaceRooms", "vExtendedPersonViews",
                "usp_MergeSpacesTable", "usp_TruncateAndReloadLoadingSpaces" })
                MigrationSql.Apply(migrationBuilder, $"ProductionBaseline.{name}.sql", module: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            throw new InvalidOperationException("The baseline cannot drop application objects. Use the separate baseline-adoption utility for migration history, or reset the disposable sandbox volume.");
        }
    }
}
