# EF migrations

Peaks has one application model and one `ApplicationDbContext`. Migrations and the model snapshot live in `Keas.Core/Migrations`. `Keas.Mvc database` runs explicit migrations and seeds disposable sandboxes using that same context. This command exits before normal web startup, configuration loading, and runtime initialization. It does not start the web host or read user secrets. One-time existing-database adoption is maintained separately.

The baseline preserves the physical schema; the EF snapshot records the application model. They intentionally differ in nullability, mapped columns, relationships and view handling. Review the affected database objects before each future migration. Existing environments retain their historical differences, including TEST's narrower columns, missing notification indexes and untrusted foreign keys. Recording the baseline does not reconcile those differences.

## What the baseline creates

`20261021183110_ProductionBaseline` creates 41 application/import tables, four views and two stored procedures through SQL embedded in Core. Fresh creation excludes historical backup tables and the Azure automatic KeySerialAssignments index. Those existing objects are retained when an existing database is registered with the baseline.

Fresh databases require `SQL_Latin1_General_CP1_CI_AS`. The SQL Server provider uses compatibility level 140, matching the existing app. SQLite retains its existing development/test behavior and does not run these SQL Server migrations. No call to `Database.Migrate` was added to application startup.

The manual [IS3 maintenance script](maintenance/PopulateIs3Fields.sql) is retained and never runs as part of a migration or initializer.

## Change the model and review SQL

Use .NET SDK from `global.json`; the local tool manifest pins `dotnet-ef` to the runtime EF version. From the repository root:

```bash
./Keas.Core/createMigration.sh MeaningfulChangeName
dotnet ef migrations script --project Keas.Core --startup-project Keas.Mvc --configuration Release --output /tmp/peaks-migration.sql
dotnet ef migrations has-pending-model-changes --project Keas.Core --startup-project Keas.Mvc --configuration Release
```

The design-time factory configures SQL Server without a connection. Scaffolding neither starts the app nor reads a deployed connection. Direct `dotnet ef database update` requires an explicit `--connection`. Updates through `updateDatabase.sh` invoke `Keas.Mvc database migrate`, use `ConnectionStrings__DefaultConnection` and require an explicitly named server and database. The script previews the target unless `--apply` is supplied. `--to MigrationId` supports reviewed rollback of later migrations. Existing-database migrations connect directly to the target and support contained users without access to `master`. Add `--create-database` only when database creation is intended; this explicit path verifies the server through `master` and allows EF to create a missing database. Preview never creates a database, and connection failures never automatically select the creation path.

EF compares the new model to the snapshot, not to a live database. It cannot discover legacy differences or new changes to unmapped tables, views, procedures and columns. Before approving a future migration, compare its affected live objects to the model's assumptions. Customize operations where legacy differences require it; add new versioned SQL resources for unmapped objects. Never rewrite an already adopted baseline. Use the sandbox to rehearse applying and rolling back each reviewed migration.

The sandbox initializer uses the same published MVC executable with `database migrate` and `database seed-sandbox`. Seeding still requires `PEAKS_SANDBOX=1` and the exact Compose `sql/PeaksSandbox` target. Normal MVC startup does not run either command.

## Existing databases and rollback

The one-time `capture`, `verify`, `adopt`, and `unadopt` commands are not shipped in this project. The preserved utility and its original tests are pinned to Peaks commit `14eb2b5a1df81fe2d2301255533f34bdd246138d`. The operator maintains a standalone `peaks-baseline-adoption` copy with its own Core source, runnable build, source hashes, dependency locks, instructions, and validation evidence. That copy has no dependency on a current Peaks checkout. The same source can be recovered from that commit if needed.

An existing database must have its baseline registered before normal migrations run. Use the preserved utility for that one-time operation. It requires an explicitly named target and a reviewed inventory, and changes migration history only. TEST was adopted on October 21, 2026. Production adoption requires separate approval, fresh schema verification, and current recovery readiness. Test fixtures are not adoption inventories.

The baseline's `Down` always refuses to run; `updateDatabase.sh --to 0` also refuses. Neither can drop application objects. Reversing adoption is a separate operation using the preserved utility, supported only before any later migration exists. It removes the baseline history row and retains an empty history table. After later migrations have been applied, use their separately reviewed rollback operations. To reset local development completely, remove only the named sandbox's volumes as documented in [SANDBOX.md](../SANDBOX.md).

## Schema regression tests

`Test/Fixtures/baseline-schema.json` stores fingerprints of the reviewed catalog captures for fresh baseline creation. The catalog reader and SQL live only in the test project; they are not included in the application. Existing-environment adoption tests and TEST-specific fixture differences are preserved with the separate utility. Tests compare all 47 objects, including column types/defaults/nullability, ordered index keys and includes, foreign keys and trust flags, check constraints, and view/procedure definitions. Only JSON property order and line endings are normalized. The fixture records its source revision; do not replace expected fingerprints with unreviewed migration output. A mutation test changes real SQL metadata and module definitions to verify rejection.

PPS import execution coverage remains deferred in [issue #1390](https://github.com/ucdavis/Peaks/issues/1390).
