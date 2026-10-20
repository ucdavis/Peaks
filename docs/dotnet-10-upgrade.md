# .NET 10 upgrade

The website, shared libraries, tests, SendMail, and LivedName target .NET 10. See [`global.json`](../global.json) for the SDK selection and [`azure-pipelines.yml`](../azure-pipelines.yml) for the Windows build and publish configuration. The project files own dependency versions, including the upgraded EF Core, ASP.NET, job configuration, and Serilog packages. The obsolete CLI scaffolding tool and redundant ASP.NET 2.2 DataAnnotations package are removed.

Windows hosting, Node 20 in CI, the frontend, schedules, and the classic release pipeline remain in place. No database migration is included. Production deployment requires separate approval.

## Compatibility decisions

- All three SQL entry points explicitly use compatibility level 140. Read-only metadata checks on October 20, 2026 confirmed level 140 on TEST and production, with zero DML triggers and zero computed columns. Both connections had VIEW DEFINITION permission, so the zero counts were not caused by hidden metadata. No database settings were changed.
- Controller endpoints retain pre-upgrade cookie redirects through `AllowCookieRedirect()`. The HTTP regression test failed with 401 instead of 302 before this change, then passed. XHR requests still return 401; no authorization requirement is relaxed.
- The existing Razor renderer and MJML pipeline render the SendMail job's actual notification view, shared layout, and acceptance button in a regression test without sending mail.
- The new SQL client dependency selected an older vulnerable PKCS package. The explicit reference and its rationale are in [`Keas.Core.csproj`](../Keas.Core/Keas.Core.csproj).
- SQL connections now inherit the newer SqlClient encryption default. Azure SQL reads were checked with the upgraded provider; local SQL installations need a trusted server certificate or an explicit development-only connection-string policy.

References: [EF 7 breaking changes](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-7.0/breaking-changes), [EF 8 breaking changes](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-8.0/breaking-changes), [EF 10 breaking changes](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-10.0/breaking-changes), and [ASP.NET 10 cookie redirects](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/10/cookie-authentication-api-endpoints?view=aspnetcore-10.0).

## Local validation

October 20, 2026, macOS ARM64:

| Check | Result |
| --- | --- |
| Original .NET 6 Release tests, isolated 6.0.36 runtime | 121 passed, 1 existing skip |
| .NET 10 solution build | Passed, including both jobs |
| .NET 10 tests, Release and Debug | 126 passed, 1 existing skip |
| Frontend tests | 8 suites, 35 tests passed |
| Website publish including npm install and production build | Passed |
| Both job publishes | Passed |
| Read-only EF 10 SQL queries on TEST and production | Parameterized Contains, pending notifications, and expiry queries checked with bounded samples |

Commands used for repeatable local checks:

```sh
dotnet build Keas.sln -c Release
dotnet test Keas.sln -c Release
dotnet test Keas.sln
# From Keas.Mvc/ClientApp:
CI=true npm run citest -- --watchAll=false --runInBand
```

Publishing runs `npm install` and `npm run build` through the existing website project target. Local frontend validation used Node 22.23.2; the Windows PR build remains the check for CI's Node 20 environment. The npm install refreshes stale root engine metadata in package-lock.json; that incidental lockfile change is excluded from this upgrade.

Existing dependency audit warnings remain for AngleSharp, DocuSign's RestSharp dependency, Serilog.Enrichers.ClientInfo, scaffolding NuGet dependencies, and the test helper's System.Security.Cryptography.Xml. Existing compiler warnings and new deprecation warnings are not suppressed. Broader dependency remediation and frontend modernization need their own scope.

## TEST and production release gates

Live Azure checks on October 20, 2026 confirmed Windows x86 .NET and ASP.NET Core 10.0.12 installed in both App Services. Recheck the available runtime before deployment. App Service's `netFrameworkVersion=v4.0` alone does not identify the loaded ASP.NET Core runtime.

Azure DevOps pipeline 12, `Peaks - CI`, validates PRs. Only master publishes the combined artifact. Classic release definition 2, `Peaks - CD`, deploys TEST automatically from that artifact, then requires manual predeployment approval for production. Do not replace or bypass that gate.

Before merging for TEST:

1. Require a successful Windows PR build and review the final package. Keep the website at the artifact root and each job at `app_data/jobs/triggered/<project-name>`, with its DLL, runtimeconfig, dependencies, `run.cmd`, and `settings.job`. SendMail's Razor views are compiled into its assembly.
2. Preserve/download build 14939's artifact, used by Release-350, for rollback. Record the candidate build and release IDs. This upgrade has no schema migration; any later schema change requires a separate compatibility assessment.
3. Recheck TEST's email suppression, database target, runtime, and job state. The handoff reported a stuck LivedName initialization and gaps in SendMail history; those remain separate TEST acceptance blockers until actual scheduled execution is observed. Always On was still false at this inspection.

After TEST deployment, prove CAS login and logout, an authorized data read and write, denied API access, valid API-token access, DocuSign callbacks, IAM updates, and notification generation with sending suppressed. Observe both scheduled jobs' completion logs, warnings, failures, and record counts. A WebJob Success status or a log saying Sent is not proof of work or delivery. Do not invoke production jobs manually.

Production requires explicit approval after TEST acceptance and rollback readiness. Preserve the existing release approval and verify the deployed runtime, web behavior, scheduled jobs, and real delivery evidence afterward. To roll back the application, redeploy the retained pre-upgrade combined artifact through the existing release pipeline with the same approval boundary. Database restore is a separate operation and has not been tested here.
