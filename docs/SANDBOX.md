# Docker sandbox

The sandbox builds the current checkout and runs Peaks with disposable SQL Server 2022. A separate initialization container applies the real EF migrations and adds fictional users and a team. The app keeps its normal startup initializer and never applies migrations at startup.

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

Open <http://localhost:5285/login> and sign in as `sandbox-admin` or `sandbox-basic`. No password or campus credentials are needed. Admin has system-admin and Sandbox Team departmental-admin roles and can open `/sandbox/people`. Basic has no team or system permissions. The team starts with one fictional person. Local login still requires Development and the explicit `LocalLogin:Enabled` setting.

The SQL and HTTP ports bind only to `127.0.0.1`. The image includes no user secrets, host environment files, or database exports. External-service URLs point at an unreachable loopback port, and no mail/import jobs run. The sandbox does not exercise CAS, IAM/KFS, ServiceNow, DocuSign, or email delivery. There is no Mailpit adapter because Peaks sends email through SparkPost rather than the template's SMTP path.

## Inspect, rebuild and stop

```bash
docker compose -f .devcontainer/docker-compose.sandbox.yml ps
docker compose -f .devcontainer/docker-compose.sandbox.yml logs --tail=100 initialize app
python3 dev/smoke-sandbox.py
docker compose -f .devcontainer/docker-compose.sandbox.yml down
```

`down` keeps data and cookie keys. Rebuild with the original `up --build -d --wait` command after changing source. This is a compiled image with no source mounts or hot reload. The `/login` health check confirms the HTTP process is ready after database initialization; the smoke script additionally checks real login, team authorization, the people API and compiled frontend assets.

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

`sql` is SQL Server's reported server name, even when the connection uses a loopback port. Always inspect the generated migration and SQL before applying it. See [database workflow](database/README.md) for existing-database adoption and legacy model/schema differences.

Run the executable SQL tests and future-migration rehearsal:

```bash
export PEAKS_TEST_SQL="$ConnectionStrings__DefaultConnection"
dotnet test Test -c Release --filter FullyQualifiedName~SqlServerMigrationTests
python3 dev/verify-migration-workflow.py
```

Tests create randomly named databases on the local server and delete only those databases. The rehearsal copies Core and DbTool into a temporary directory, scaffolds a no-change migration, verifies its actual operations are empty, adds a temporary nullable property, then verifies applying and rolling back that migration preserves an existing row. It never edits the application model in this checkout.

The database-backed tests skip when `PEAKS_TEST_SQL` is absent; the model snapshot and explicit-connection checks still run. The GitHub migration workflow supplies a disposable SQL Server and requires these tests, the rehearsal and the sandbox HTTP smoke test. The existing Azure pipeline continues running the full server/frontend suite and publishing normally.
