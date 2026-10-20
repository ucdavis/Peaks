# Frontend development

PEAKS uses Razor for HTML, authentication, anti-forgery tokens and routing. React 17
and React Router 5 render the asset routes inside the shared layout. Vite builds
and serves frontend assets; it does not serve the application's pages or APIs.

Follow the [README setup instructions](../README.md#build-and-run) to install
dependencies and start the application. Trust the ASP.NET
Core development certificate with `dotnet dev-certs https --trust` if needed.
Visual Studio's Project and IIS Express launch profiles both enable Vite.

The .NET hosted service starts the Node launcher, waits for its private readiness
signal and fails startup if Node is missing, the port is occupied, or startup
expires. It stops only its own child process. Closing stdin also stops Vite when
a debugger terminates .NET. An unexpected Vite exit stops the development app.
Restart the normal app command after fixing the reported error.

Vite binds to http://localhost:5179. Browsers allow HTTP loopback resources from
the local HTTPS page. CORS allows the three MVC launch-profile origins; custom
MVC ports can set `FRONTEND_MVC_ORIGIN` to the exact MVC origin.
`Vite:DevServerUrl` can select another localhost HTTP port. The hosted service
passes that origin to Vite. Do not start a second Vite process alongside the app.

The launch profiles set `Vite__UseDevServer=true`; the default is off.
Production and Staging always use built assets, even if that setting is enabled.
For a published build in Development, run the published DLL without launch
profiles and leave `Vite__UseDevServer` unset or set it to `false`.

## Assets and tests

`src/index.tsx` preserves the existing CSS import order. Razor emits all CSS
from its manifest entry in the document head. In development, the same JavaScript
CSS imports inject styles into the head, retaining Vite HMR and the original
cascade order.
The React module follows the Razor body and `ScriptVariables`, so `window.App`
is ready before React reads it. The manifest helper resolves imported CSS,
deduplicates tags per request, and prefixes published URLs with the request's
PathBase. Vite builds relative asset references. Autoprefixer and the build target use the
existing Browserslist policy. Existing root-relative MVC
routes and `/media` references retain their existing root-hosted behavior.
Public images and robots.txt live in `wwwroot` and are served by MVC in both modes.

Run these commands in `Keas.Mvc/ClientApp`:

```sh
npm run typecheck
npm run lint
npm test
npm run citest
npm run test:launcher
npm run build
```

Before running server tests, build the frontend assets that the integration tests
request. From the repository root:

```sh
npm --prefix Keas.Mvc/ClientApp run build
dotnet test Test/Test.csproj
```

`npm test` runs Vitest once; `npm run testwatch` watches. The eight existing test
files still use React 17's rendering APIs. CI writes JUnit results to
`test-results/junit.xml` and Cobertura coverage to `coverage/cobertura-coverage.xml`.
The launcher tests run the real Vite server and check readiness, module/CSS
responses, CORS, occupied-port handling and stdin shutdown. Server tests also
exercise the Razor helper and hosted-process lifecycle.

`dotnet publish Keas.Mvc/Keas.Mvc.csproj -c Release -o <output>` runs `npm ci` and
builds fresh assets into `wwwroot/vite`, including `.vite/manifest.json`. Generated
files are excluded from the project's initial content glob and then included
after the build, preventing old hash files from entering a fresh publish directory.
Use a fresh output directory for each release. The Azure pipeline retains the
website and both Windows WebJobs under `app_data/jobs/triggered`.

Before approving deployment, verify authenticated asset deep links and refresh,
React navigation, an authorized API write with its anti-forgery token, representative
report/admin pages, global styles and images, React/CSS HMR, and normal startup
and shutdown. A build alone does not establish those behaviors. Windows Visual
Studio F5 requires a separate check on Windows. Live CAS sign-in and complete
SQL Server-backed data flows remain pending manual acceptance checks for this
migration.
