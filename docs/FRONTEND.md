# Frontend development

PEAKS uses Razor for HTML, authentication, anti-forgery tokens and routing. React 18
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

If `dotnet watch` crashes inside `HotReloadMSBuildWorkspace`, stop it and run
`npm run start:stable` from `Keas.Mvc`. This disables .NET hot reload and uses
rebuild/restart on watched changes instead. Vite still handles React and CSS HMR.
The normal `npm start` command continues to enable .NET hot reload.

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

### Styles

`Keas.Mvc/ClientApp/src/styles/main.css` is the stylesheet entry point. It loads
Tailwind CSS 4, daisyUI 5 and `@ucdavis/gunrock-tailwind` (the same branding package
as Walter). The `peaks` daisyUI theme is the default and is selected explicitly on
the shared Razor layout. Edit the shared color, surface, border, radius and size
tokens here. Gunrock supplies the UC Davis palette and Proxima Nova font families.
The `content-wrapper` utility gives the header, navigation, messages, page content
and footer a centered `max-w-[1600px]` shell with responsive 1rem/1.5rem/2rem
horizontal padding. The shared layout applies it to all pages automatically.
Use standard classes such as `btn btn-primary`, `bg-base-200`, `text-primary-color`
and `border-main-border`; no prefixes are required. Both React and Razor views
are scanned for classes. Use complete class names rather than constructing them
from string fragments.

`styles/legacy.css` contains the flattened application styles, without Bootstrap.
There is no Sass compiler or Gunrockin dependency. The legacy layer sits between
the base reset and modern components/utilities so new classes can override it.
Its `--legacy-rem` variable preserves old 8px/10px sizing while the document keeps
a normal root font size for modern components. Remove legacy rules as each screen
is migrated; put new styles and tokens in `main.css`.

Bootstrap's package, CDN CSS, JavaScript and Popper script are removed. The shared
layout uses native details dropdowns and a small menu/message handler instead.
Navigation styling is expressed directly in Tailwind classes in `_Layout.cshtml`,
with a collapsible stacked menu below `lg` and horizontal navigation above it.
`src/navigation.ts` handles mobile expansion, Escape, outside-click dismissal and
closing other open dropdowns. The legacy navigation selectors have been removed;
the asset screen's `.react-tabs` styles remain until that separate UI is migrated.
Reactstrap and react-bootstrap-typeahead remain temporarily because existing
React screens still use them. A small modal compatibility block in `main.css`
keeps Reactstrap dialogs visible, but this is not a completed screen-by-screen
conversion: Bootstrap grid, form and utility markup still needs migration.

`src/index.tsx` delegates mounting to `renderApp.tsx`, which uses `createRoot`.
Its imports load component styles before site styles. Razor emits all CSS
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

`npm test` runs Vitest once; `npm run testwatch` watches. Component tests use
Testing Library's React 18 rendering APIs; bootstrap tests exercise `renderApp`
and unmount its root during cleanup. CI writes JUnit results to
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
