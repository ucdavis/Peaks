# EF migrations and existing database adoption

Peaks has one application model and one `ApplicationDbContext`. Migrations and the model snapshot live in `Keas.Core/Migrations`. `Keas.DbTool` is an explicit command-line runner using that same context; it has no second EF model, web host, startup seeding, or user-secret lookup.

The baseline preserves production's physical schema and the application's current behavior. The snapshot records the existing application model for future model comparisons. Those two descriptions intentionally differ. See [the comparison](baseline-comparison.md) before changing an affected object.

## What the baseline creates

`20261021183110_ProductionBaseline` creates 41 application/import tables, four views and two stored procedures from the October 21, 2026 production capture. Versioned SQL is embedded in the Core assembly. The ten historical `_20250421_bak` tables remain in the production inventory and are never changed by adoption, but are not created in fresh databases.

The Azure automatic index `nci_msft_1_KeySerialAssignments_E1E481049847DD46716CAB3B3F5C9B0E` is also excluded from fresh creation. Its complete definition is recorded in the production inventory, and production adoption verifies it. It indexes `KeySerialId` and includes ApprovedAt, ConfirmedAt, ExpiresAt, IsConfirmed, NextNotificationDate, PersonId, RequestedAt, RequestedById and RequestedByName. It remains a platform-managed index. Other production indexes, including both additional Notifications indexes, are created normally.

Fresh databases require `SQL_Latin1_General_CP1_CI_AS`. The SQL Server provider uses compatibility level 140, matching the existing app. SQLite retains its existing development/test behavior and does not run these SQL Server migrations. No call to `Database.Migrate` was added to application startup.

The [SQL project audit](sql-project-audit.md) accounts for every removed SQL-project file. The manual [IS3 maintenance script](maintenance/PopulateIs3Fields.sql) is retained and is not part of any migration or initializer.

## Change the model and review SQL

Use .NET SDK from `global.json`; the local tool manifest pins `dotnet-ef` to the runtime EF version. From the repository root:

```bash
./Keas.Core/createMigration.sh MeaningfulChangeName
dotnet ef migrations script --project Keas.Core --startup-project Keas.DbTool --configuration Release --output /tmp/peaks-migration.sql
dotnet ef migrations has-pending-model-changes --project Keas.Core --startup-project Keas.DbTool --configuration Release
```

The design-time factory configures SQL Server without a connection. Scaffolding neither starts the app nor reads a deployed connection. Direct `dotnet ef database update` requires an explicit `--connection`. Updates through `updateDatabase.sh` use `ConnectionStrings__DefaultConnection` and require an explicitly named server and database. The script previews the target unless `--apply` is supplied. `--to MigrationId` supports reviewed rollback of later migrations. Existing-database migrations connect directly to the target and support contained users without access to `master`. Add `--create-database` only when database creation is intended; this explicit path verifies the server through `master` and allows EF to create a missing database. Preview never creates a database, and connection failures never automatically select the creation path.

EF compares the new model to the snapshot, not to a live database. It cannot discover legacy differences or new changes to unmapped tables, views, procedures and columns. Before approving a future migration, compare its affected live objects to the model's assumptions. Customize operations where legacy differences require it; add new versioned SQL resources for unmapped objects. Never rewrite an already adopted baseline. Use the sandbox to rehearse applying and rolling back each reviewed migration.

## Read-only inventory and verification

Set `ConnectionStrings__DefaultConnection` through your approved local credential source. Do not put real credentials in scripts, command history, committed files or logs.

```bash
dotnet run --project Keas.DbTool -c Release -- capture --output /tmp/approved-schema.json
dotnet run --project Keas.DbTool -c Release -- verify --schema /tmp/approved-schema.json --server SERVER_NAME --database DATABASE_NAME
```

Capture reads catalog metadata only. The JSON includes the server's reported name, database name, capture time and ordered object metadata. It requires database `VIEW DEFINITION`, and rejects unreadable/encrypted modules. It includes column types, lengths, nullability, collation, identity seed/increment, defaults, computed expressions, keys, indexes and included columns, FK actions/trust, check constraints, views and procedures. Database settings, principals, grants and application rows are outside this inventory. Generated primary-key names are normalized; module line endings are normalized for comparison. Other differences cause verification to fail.

The committed captures are dated evidence. Immediately before a future adoption, obtain a new read-only capture, compare it with the reviewed inventory, and resolve unexpected drift before approving it. Do not capture and automatically accept an arbitrary new schema. Keep deployment/DDL changes paused during adoption; the migration lock coordinates with EF, not arbitrary DBA scripts.

## Adopt an existing database

Implementation and review do not authorize TEST or production adoption. TEST adoption and production adoption are separate operator approvals. Confirm recovery readiness and the exact target, review the refreshed inventory, and rehearse that approved schema in disposable SQL Server first. TEST's known differences remain intact.

After approval, run the check without `--apply`:

```bash
dotnet run --project Keas.DbTool -c Release -- adopt --schema /tmp/approved-schema.json --server SERVER_NAME --database DATABASE_NAME
```

The connection's actual identity, requested identity and inventory identity must all agree. The command holds EF's migration application lock and a database transaction while checking the schema and migration history. Unexpected schema, conflicting migration history or an unsafe history-table shape stops the command. If history is absent, adoption preview and apply also reject enabled database or server DDL triggers subscribed to `CREATE_TABLE`, including event-group subscriptions. Triggers are never disabled by the tool. On SQL Server and Managed Instance, creating history also requires server `VIEW ANY DEFINITION` so hidden server triggers cannot bypass this check. Azure SQL Database has no server-scoped triggers and requires only the existing database metadata permissions. These checks do not change the inventory format.

To adopt, repeat that exact command with `--apply`. It creates `dbo.__EFMigrationsHistory` if absent and inserts only the baseline row. Repeating adoption is safe. It does not execute baseline creation, alter application objects, add missing FKs, repair historical records, or seed application data. A normal baseline update on an unregistered populated database fails with an adoption instruction.

Verify the saved history row and rerun `verify`, then check the application's normal user flows before calling adoption complete. Preserve the before/after capture and execution evidence. Adopt TEST first; production requires its own approval and fresh comparison.

## Rollback

The baseline's `Down` always refuses to run; `updateDatabase.sh --to 0` also refuses. The baseline rollback commands never drop application objects.

Before any later migration exists, use `unadopt` with the same reviewed inventory and explicit identity, first without `--apply`, then with it after rollback approval. It verifies the schema and refuses conflicting or later migration history, then removes only the baseline row. An empty history table is deliberately retained because its ownership before adoption cannot be inferred later. Removing an empty table created by adoption is an optional manual cleanup only when retained evidence proves it was newly created.

After later migrations have been applied, use their separately reviewed rollback operations. To reset local development completely, remove only the named sandbox's volumes as documented in [SANDBOX.md](../SANDBOX.md).

## Known data and behavior constraints

The October 21 read-only checks found 2,371 Documents, no null/missing Person references, and 357 active Documents belonging to inactive People. The required relationship and Person Active filter retain the existing INNER JOIN behavior that hides those documents. Do not make PersonId optional as part of baselining.

Of 42,070 PersonNotifications, 106 referenced missing People. Of those, 102 had Pending set, but none had both Pending and a nonempty recipient email. Their saved person name/email and history remain intact. Team navigation on notifications and PPS departments is retained even where physical FKs are absent. Notifications has about 2.52 million rows; attempts to verify all Team references timed out. That data-integrity question remains unresolved and adoption does not add a Team FK or claim to validate it.

These counts are historical evidence, not live assertions or fresh data guarantees. Behavior-affecting reconciliation remains separate work.

PPS import regression coverage through `IdentityService.BulkLoadPeople` is explicitly deferred for this change. The SQL tests check PPS department navigation loading, not import execution, inactive-person reactivation, or import notification persistence.
