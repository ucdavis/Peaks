[![Node Version](https://img.shields.io/badge/dynamic/json?color=green&label=node&query=%24.engines.node&url=https%3A%2F%2Fraw.githubusercontent.com%2Fucdavis%2FPeaks%2Fmaster%2FKeas.Mvc%2FClientApp%2Fpackage.json)](https://img.shields.io/badge/dynamic/json?color=green&label=node&query=%24.engines.node&url=https%3A%2F%2Fraw.githubusercontent.com%2Fucdavis%2FPeaks%2Fmaster%2FKeas.Mvc%2FClientApp%2Fpackage.json)
[![Build Status](https://dev.azure.com/ucdavis/Peaks/_apis/build/status/ucdavis.Peaks?branchName=master)](https://dev.azure.com/ucdavis/Peaks/_build/latest?definitionId=12&branchName=master)

[![forthebadge](http://forthebadge.com/images/badges/uses-html.svg)](http://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/contains-technical-debt.svg)](https://forthebadge.com)

# PEAKS (formerly Keas)

**P**eople
**E**quipment
**A**ccess
**K**eys
**S**pace

## Sort tables

Click a sortable column heading, or tab to it and press Enter or Space, to cycle
through ascending, descending and unsorted order. Hold Shift to sort by multiple
columns. Keyboard focus is visible, and each sorted column exposes its direction
to screen readers.

## Run the Docker sandbox

Run the app and real SQL Server migrations with fictional data and local login. Docker Desktop must be running.

```bash
export SANDBOX_PROJECT=peaks-my-feature
export SANDBOX_PORT=5285
export SANDBOX_SQL_PORT=14339
docker compose -f .devcontainer/docker-compose.sandbox.yml up --build -d --wait
```

Open <http://localhost:5285/login> and enter `sandbox-admin`. Use a unique project name and ports for each worktree. See [sandbox setup, reset and tests](docs/SANDBOX.md), and [EF migration workflow](docs/database/README.md).

## MCP presentation spike: ngrok and the custom-server form

This DEMO branch exposes the fictional Docker sandbox through ngrok so the
**Add custom MCP server** form can discover OAuth, open the PEAKS login page,
and call inventory tools from **Try Now**. Login is `sandbox-admin`, with no
password or Entra connection. Only use this with the disposable sandbox data.
Anyone with the public URL can use that demo login.

From this checkout, with Docker Desktop running, a trusted .NET development
certificate, Python 3, OpenSSL, and ngrok installed and authenticated:

```bash
bash scripts/mcp-demo.sh start
bash scripts/mcp-demo.sh tunnel
```

Leave the tunnel running. In another terminal in this checkout:

```bash
bash scripts/mcp-demo.sh public
bash scripts/mcp-demo.sh refresh-dates
```

`public` reads the live ngrok URL and restarts only the demo app with that URL as
its OAuth issuer. Paste the printed **Server URL**, including `/mcp`, into the
form. Choose **OAuth** and **Dynamic Client Registration**, with scopes
`peaks.inventory.read offline_access`. The token endpoint authentication method
is `none`; you do not supply a client ID or secret. Create the PEAKS Demo plugin,
connect, sign in as `sandbox-admin`, allow read access, then use **Try Now**.
Ask “What equipment expires this week?” or “What Apple equipment does Javier Morales have?”

If the form shows an individual callback such as
`https://chatgpt.com/connector/oauth/...`, copy its complete value and run:

```bash
bash scripts/mcp-demo.sh public 'PASTE_THE_EXACT_CHATGPT_CALLBACK_URL_HERE'
```

The standard `https://chatgpt.com/connector_platform_oauth_redirect` callback is
already allowed in ngrok mode. The command above allows one additional exact
ChatGPT callback, not a wildcard.

To rehearse again, visit the printed `/oauth/connections` page and revoke the
old grant, remove the plugin in Codex, visit `/logout` to clear the PEAKS browser
login, then add the plugin again. Without the logout step, the browser can reuse
its session. Removing a plugin alone is not proof that its server grant was
revoked. A new plugin may show a different individual callback; rerun `public`
with that exact URL if needed. Refreshing the dates changes only the three
`MCP-DEMO-*` fixture loan dates, preserving other inventory and OAuth records.

Stop the public tunnel with Ctrl+C in its terminal. `bash scripts/mcp-demo.sh stop`
stops the Docker sandbox and retains its volumes; it does not stop ngrok.
`bash scripts/mcp-demo.sh local` restores the localhost issuer for the original
local Codex plugin. `start` otherwise keeps the last selected mode. If ngrok
assigns a different address after a restart, rerun `public` and add the new URL
in the plugin form. Existing grants are tied to the old issuer/resource.

See [MCP demo setup, flow, safeguards and validation](docs/MCP-DEMO.md) for details.
The public address and optional callback are stored in ignored
`.local/mcp/mode.env`. Certificates, SQLite OAuth records and tokens must stay
out of git. ngrok request inspection is disabled, and the tunnel verifies HTTPS
to the local app without rewriting the public Host header.

# Build and run

Install the .NET SDK selected by [`global.json`](global.json). Use Node.js 22.18 or newer on Node 22 to match the [CI pipeline](azure-pipelines.yml), with npm 10 or newer as required by the [frontend package](Keas.Mvc/ClientApp/package.json).

With NVM for Windows:

```sh
nvm install 22
nvm use 22
```

Before running with SQL Server, review the [startup migration prerequisites](docs/database/README.md#automatic-startup-migrations).

Get the application settings from Box and configure the website's user secrets.

From the repository root, install the frontend dependencies and start the website:

```sh
cd Keas.Mvc/ClientApp
npm ci
cd ..
dotnet restore
npm start
```

`npm start` runs `dotnet watch run` from `Keas.Mvc`. The development launch profile starts Vite automatically and waits for its readiness. MVC serves the website at https://localhost:44332; Vite serves assets at http://localhost:5179.

See [frontend development](docs/FRONTEND.md) for test commands, asset publishing, configuration and verification.

With Visual Studio, open `Keas.sln` and run `Keas.Mvc` after completing the dependency and secrets setup.

## Optional local development login

To bypass CAS locally, enable the login screen with a personal user secret:

```sh
dotnet user-secrets set "LocalLogin:Enabled" "true" --project Keas.Mvc
```

Run the app in `Development` and open `/login`. Enter the Kerberos ID or email
of an existing user in your configured database, or choose **Sign in with CAS**.
Local login uses that user's current database permissions and does not create
accounts or grant roles. Peaks has no account-level active flag. Unknown or
ambiguous identities are rejected. Local sessions log out back to `/login`,
where you can choose another user; cached permissions are cleared on sign-in
and logout. CAS sessions keep their normal CAS logout behavior.

The feature is disabled by default and unavailable outside `Development`, even
if the setting is enabled. Keep development instances bound to localhost because
anyone who can reach an enabled instance can sign in as an existing user. No
tracked launch settings need to change. To disable the feature:

```sh
dotnet user-secrets remove "LocalLogin:Enabled" --project Keas.Mvc
```
