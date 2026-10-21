#!/usr/bin/env python3
"""Scaffold and execute throwaway migrations without changing the checkout.

Requires PEAKS_TEST_SQL pointing at disposable loopback/Compose SQL Server.
The generated Probe executable validates migration operations and database state.
"""
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]


def run(directory, *args):
    result = subprocess.run(args, cwd=directory, capture_output=True, text=True)
    if result.returncode:
        # Only tooling/build diagnostics; the probe never logs its connection string.
        raise RuntimeError(result.stdout + result.stderr)


def main():
    if not os.environ.get("PEAKS_TEST_SQL"):
        raise SystemExit("Set PEAKS_TEST_SQL to the disposable sandbox SQL Server.")
    with tempfile.TemporaryDirectory(prefix="peaks-migration-workflow-") as temporary:
        work = Path(temporary)
        for name in ("Keas.Core", "Keas.DbTool", ".config"):
            shutil.copytree(ROOT / name, work / name, ignore=shutil.ignore_patterns("bin", "obj"))
        shutil.copy2(ROOT / "global.json", work / "global.json")
        probe = work / "Probe"
        probe.mkdir()
        (probe / "Probe.csproj").write_text('''<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net10.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings></PropertyGroup>
  <ItemGroup><ProjectReference Include="../Keas.Core/Keas.Core.csproj" /></ItemGroup>
</Project>''')
        (probe / "Program.cs").write_text('''using Keas.Core.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
var connection = new SqlConnectionStringBuilder(Environment.GetEnvironmentVariable("PEAKS_TEST_SQL"));
if (!new[] { "127.0.0.1", "localhost", "sql" }.Contains(connection.DataSource.Split(',')[0]))
    throw new Exception("Only disposable local SQL Server is allowed.");
connection.InitialCatalog = "PeaksMigrationProbe_" + Guid.NewGuid().ToString("N");
using var context = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
    .UseSqlServer(connection.ConnectionString, o => o.UseCompatibilityLevel(140)).Options);
var migrations = context.GetService<IMigrationsAssembly>();
var last = migrations.CreateMigration(migrations.Migrations.Last().Value, context.Database.ProviderName);
if (args[0] == "empty") {
    if (last.UpOperations.Count != 0 || last.DownOperations.Count != 0) throw new Exception("Unchanged model generated operations.");
    return;
}
try {
    await context.Database.MigrateAsync();
    await context.Database.OpenConnectionAsync();
    using var cmd = context.Database.GetDbConnection().CreateCommand();
    cmd.CommandText = "INSERT dbo.Teams (Name,Slug,MigrationProbe) VALUES ('Keep me','keep-me',17); SELECT MigrationProbe FROM dbo.Teams WHERE Slug='keep-me'";
    if (Convert.ToInt32(await cmd.ExecuteScalarAsync()) != 17) throw new Exception("Additive migration did not persist the new value.");
    await context.GetService<IMigrator>().MigrateAsync("20261021183110_ProductionBaseline");
    cmd.CommandText = "SELECT CASE WHEN COL_LENGTH('dbo.Teams','MigrationProbe') IS NULL AND (SELECT COUNT(*) FROM dbo.Teams WHERE Slug='keep-me')=1 THEN 1 ELSE 0 END";
    if (Convert.ToInt32(await cmd.ExecuteScalarAsync()) != 1) throw new Exception("Rollback failed to preserve existing data or remove the new column.");
} finally {
    await context.Database.CloseConnectionAsync();
    await context.Database.EnsureDeletedAsync();
}
''')
        run(work, "dotnet", "tool", "restore")
        run(work, "dotnet", "restore", "Keas.DbTool")
        ef = ("dotnet", "ef", "migrations", "add")
        flags = ("--project", "Keas.Core", "--startup-project", "Keas.DbTool", "--configuration", "Release")
        snapshot = work / "Keas.Core/Migrations/ApplicationDbContextModelSnapshot.cs"
        original_snapshot = snapshot.read_bytes()
        run(work, *ef, "NoChangeProbe", *flags)
        run(work, "dotnet", "run", "--project", "Probe", "--configuration", "Release", "--", "empty")
        print("Unchanged-model migration has zero Up and Down operations.", flush=True)
        for path in (work / "Keas.Core/Migrations").glob("*NoChangeProbe*.cs"):
            path.unlink()
        snapshot.write_bytes(original_snapshot)
        model = work / "Keas.Core/Domain/Team.cs"
        source = model.read_text()
        marker = "public class Team\n    {"
        if source.count(marker) != 1:
            raise RuntimeError("Cannot locate the Team fixture insertion point.")
        model.write_text(source.replace(marker, marker + "\n        public int? MigrationProbe { get; set; }"))
        run(work, *ef, "AdditiveProbe", *flags)
        run(work, "dotnet", "run", "--project", "Probe", "--configuration", "Release", "--", "roundtrip")
        print("Additive migration and rollback passed on disposable SQL Server; existing row preserved.", flush=True)


if __name__ == "__main__":
    main()
