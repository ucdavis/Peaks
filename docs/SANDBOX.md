# Docker sandbox

The sandbox builds the current checkout and runs Peaks with disposable SQL Server 2022. A separate initialization container creates the database, applies the real EF migrations and adds fictional users, a team, and demo inventory. See [automatic startup migrations](database/README.md#automatic-startup-migrations) for the app startup behavior.

## Start

Docker Desktop must be running. SQL Server uses AMD64, so Apple Silicon needs AMD64 emulation enabled. Allocate at least 2 GB for SQL Server plus memory for the app and build.

From the repository root, choose a unique project name and free ports for this checkout:

```bash
export SANDBOX_PROJECT=peaks-my-feature
export SANDBOX_PORT=5285
export SANDBOX_SQL_PORT=14339
docker compose -f .devcontainer/docker-compose.sandbox.yml up --build -d --wait
```

Keep these exports in each terminal used for this sandbox. `SANDBOX_PROJECT` selects its containers, network, database volume, cookie keys, and cookie names. Use lowercase letters, digits, dashes or underscores, starting with a letter or digit, at most 64 characters. Other worktrees need different project names and ports.

Open <http://localhost:5285/login> and sign in as `sandbox-admin` or `sandbox-basic`. No password or campus credentials are needed. Admin has system-admin and Sandbox Team departmental-admin roles and can open `/sandbox/people`. Basic has no team or system permissions. The team starts with 31 active people plus two inactive people, 62 active equipment items plus two retired items, 12 rooms, 32 workstations, 12 key types with 48 serials, and 12 access types. Assignments include pending confirmations, expired loans, items expiring in seven days, and longer-term loans. Some people have multiple assignments across asset types; others have none. Spare equipment, desks, and keys remain available for testing assignment flows. All names and contact information are fictional.

The initialization seed runs on every Compose startup. Stable fixture identifiers prevent duplicate rows and preserve edits to existing demo records, including inactive records. Dates are relative to the first seed run; rebuilding does not refresh existing assignments. Reset the sandbox to get fresh dates. Local login still requires Development and the explicit `LocalLogin:Enabled` setting.

The SQL and HTTP ports bind only to `127.0.0.1`. The image includes no user secrets, host environment files, or database exports. External-service URLs point at an unreachable loopback port, and no mail/import jobs run. The sandbox does not exercise CAS, IAM/KFS, ServiceNow, DocuSign, or email delivery. There is no Mailpit adapter because Peaks sends email through SparkPost rather than the template's SMTP path.

## Inspect, rebuild and stop

```bash
docker compose -f .devcontainer/docker-compose.sandbox.yml ps
docker compose -f .devcontainer/docker-compose.sandbox.yml logs --tail=100 initialize app
docker compose -f .devcontainer/docker-compose.sandbox.yml down
```

`down` keeps data and cookie keys. Rebuild with the original `up --build -d --wait` command after changing source. This is a compiled image with no source mounts or hot reload. The `/login` health check confirms the HTTP process is ready after database initialization.

To discard only this sandbox's data and cookie keys:

```bash
docker compose -f .devcontainer/docker-compose.sandbox.yml down -v
docker compose -f .devcontainer/docker-compose.sandbox.yml up --build -d --wait
```

## Migration development and tests

The disposable SQL credentials are in Compose. From the host:

```bash
export ConnectionStrings__DefaultConnection="Server=127.0.0.1,${SANDBOX_SQL_PORT:-14339};Database=PeaksSandbox;User ID=sa;Password=SandboxOnly123!;Encrypt=False;TrustServerCertificate=True;"
./Keas.Core/createMigration.sh DescribeYourChange
./Keas.Core/updateDatabase.sh --server sql --database PeaksSandbox --apply
```

`sql` is SQL Server's reported server name, even when the connection uses a loopback port. Always inspect the generated migration and SQL before applying it. See [database workflow](database/README.md) for migration safeguards, legacy model/schema differences, and the separate one-time adoption prerequisite.

Run the SQL integration tests:

```bash
export PEAKS_TEST_SQL="$ConnectionStrings__DefaultConnection"
dotnet test Test -c Release --filter FullyQualifiedName~SqlServerMigrationTests
```

Tests create randomly named databases on the local server and delete only those databases.

The database-backed tests skip when `PEAKS_TEST_SQL` is absent; the model snapshot and explicit-connection checks still run. Run these tests locally. GitHub automation is deferred until test coverage is broader; see [issue #1390](https://github.com/ucdavis/Peaks/issues/1390). The existing Azure pipeline continues running the full server/frontend suite and publishing normally.
