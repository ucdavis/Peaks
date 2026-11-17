# PEAKS local MCP presentation demo

This branch adds a read-only MCP adapter to the Docker sandbox. There are two
connection modes. The local Codex configuration calls `https://localhost:5446/mcp`.
The **Add custom MCP server** plugin form uses a public ngrok HTTPS URL, with
the same app and data still running in Docker on this computer. No Entra
registration or cloud app deployment is needed.

For the public tunnel, use the [README rehearsal steps](../README.md#mcp-presentation-spike-ngrok-and-the-custom-server-form).
The following local instructions describe the original CLI connection mode.

The browser uses PEAKS' existing fictional local users. This demonstrates real
OAuth authorization, PKCE, consent, refresh, and revocation. It does not
demonstrate Entra or CAS authentication. Mailbroker can supply that separate
example in the presentation.

## Start and connect locally

1. Start Docker Desktop. Install .NET 10 and ensure `dotnet dev-certs https --check --trust`
   succeeds. If needed, use `dotnet dev-certs https --trust` and complete the OS prompt.
2. If switching back from ngrok, run `bash scripts/mcp-demo.sh local` first.
   Run `bash scripts/mcp-demo.sh start`. It builds this checkout and starts only
   the `peaks-mcp-demo` Compose project. HTTP uses port 5286, HTTPS 5446, and SQL 14340.
3. Run `bash scripts/mcp-demo.sh connect`. It installs the local PEAKS plugin
   and opens Codex's OAuth flow with inventory and refresh-token scopes.
   Sign in as `sandbox-admin`, then select **Allow read access**.
4. Open a fresh local Codex chat and select PEAKS. If the plugin does not appear
   immediately, restart the Codex desktop app to reload its local plugin list.
5. Open `https://localhost:5446/sandbox/equipment` alongside Codex.

The localhost certificate must be trusted by the browser and the Codex process.
The startup script exports an existing trusted .NET development certificate to
git-ignored `.local/mcp`. An initialization container copies it to a private
volume readable only by the app user. This demo reuses that certificate for
OpenIddict signing/encryption; production would use independently managed keys.
Do not disable TLS verification to connect.

The local plugin source is `plugins/peaks`. It points to port 5446. The connect
script requests `peaks.inventory.read` and `offline_access`, using dynamic
registration with a loopback callback. Re-run `connect` to show the browser
consent sequence or reconnect after the eight-hour grant expires. It also
reinstalls the plugin after package changes; start a new chat if an existing
chat still has the old tool list. This setup was verified with Codex CLI 0.154.0.

## Connect through the custom-server form

Run `bash scripts/mcp-demo.sh demo` for the complete startup sequence, using the
already-built sandbox images. Use `demo --build` once ahead of the presentation
or after application changes. The launcher waits for Compose health and ngrok's
explicit tunnel-ready event, reuses an existing demo tunnel, preserves the saved
callback and refreshes the three demo loan dates. It leaves existing grants intact.
Use `check` for a read-only public endpoint check; follow it with a real Codex query.

Alternatively, run `start`, keep `tunnel` running in one terminal, then run `public` in another.
The script obtains the URL from ngrok's local agent API and saves it in ignored
`.local/mcp/mode.env`. `public` and `local` restart only the app container; neither
removes data. The existing sandbox project and ports stay isolated from other apps.

Discovery, authorization, token exchange, revocation and `/mcp` all use the
same public origin. The tunnel forwards to **HTTPS** on `localhost:5446`, preserves
the public Host, and verifies the development certificate explicitly. PEAKS does
not need to trust caller-supplied forwarded headers. OAuth keeps S256 PKCE,
resource binding, consent, and the same token lifetimes. In this mode the browser
returns the authorization code to ChatGPT's callback, not a loopback listener.
OpenIddict includes `iss` in the response and advertises issuer identification.

The stable ChatGPT callback is enabled only with `McpDemo:AllowNgrok`. An individual
`/connector/oauth/{callback_id}` must be copied exactly from the form and supplied
as the second argument to `public`. Discovery advertises DCR; CIMD is not implemented.
The client is public and uses token endpoint authentication `none`, plus PKCE.
MCP tool requests still require a valid access token.

To rehearse a fresh connection, revoke its grant on `/oauth/connections`, remove
the plugin in Codex, and open `/logout` on the **public** origin. Then add it again.
The HTTPS localhost cookie is separate from the public-origin cookie. The app
shows consent each time; clearing the browser session also shows the login form.
Revoking the grant invalidates access and refresh tokens immediately on subsequent
requests. Revoked grants and old DCR client records remain in SQLite. The demo caps
registrations at 100, which is ample for rehearsal, but it has no automatic cleanup.

If the free ngrok service shows a browser interstitial, continue to the site once.
OAuth metadata endpoints must return JSON to the client; do not paste an interstitial
URL or a localhost URL into the public-server form. Check `status` for the selected
issuer. If the ngrok address changes, rerun `public`, update the plugin URL, and
reauthorize. Stop ngrok separately from Docker when finished.

References: [OpenAI custom-server setup](https://developers.openai.com/plugins/deploy/connect-chatgpt),
[OAuth callbacks](https://developers.openai.com/plugins/build/auth), and
[ngrok HTTPS forwarding](https://ngrok.com/docs/gateway/endpoints/http).

## Explain the local connection

```mermaid
sequenceDiagram
    participant C as Local Codex
    participant P as PEAKS sandbox
    participant B as Browser
    C->>P: Call /mcp without a token
    P-->>C: 401 + protected-resource metadata URL
    C->>P: Discover OAuth endpoints; register loopback callback
    C->>B: Open authorization URL with PKCE challenge
    B->>P: Local sign-in; allow inventory read access
    P-->>C: Authorization code via browser loopback redirect
    C->>P: Exchange code + PKCE verifier for scoped tokens
    C->>P: Call MCP tool with bearer token
    P->>P: Check token, consent, current user permissions and fixed team
    P-->>C: Bounded equipment results
```

In an Entra-backed application, Entra would authenticate the browser user during
the sign-in step. The app's MCP authorization and the model's tool selection are
separate concerns. Here, the local Codex process makes the localhost request;
the cloud model does not need direct access to this port. The model receives
the fictional tool results through Codex.

## Presentation sequence

- Connect the plugin and show the PEAKS login and consent pages.
- Ask **What equipment expires this week?** The tool defines the Pacific week
  as Monday through Sunday and returns the actual range. Expiration means a
  loan/assignment due date, not a warranty date.
- Ask **What Apple equipment does Javier Morales have?** Codex finds the
  person first, then queries that person's equipment with the Apple filter.
- Ask **What equipment is unassigned?**
- Show the same equipment in the browser. Fixtures `MCP-DEMO-01` through `03`
  ensure there are assignments due in the week when the database is first seeded.
- Open `https://localhost:5446/oauth/connections` and revoke the connection.
  Subsequent calls with that grant fail, including refresh.
- To demonstrate permission denial, sign out in PEAKS, reconnect Codex as
  `sandbox-basic`, and retry a query. Basic has no team permissions.
  Website logout alone does not revoke an existing MCP grant.

The original sandbox and the extra fixtures preserve existing edits. Rebuilding
does not move due dates forward. Run `bash scripts/mcp-demo.sh refresh-dates`
before a later presentation to move the three `MCP-DEMO-*` assignment due dates
to the current Pacific week. It does not erase inventory or OAuth connections.

## Implementation boundaries

- `McpDemo:Enabled` defaults off. Startup rejects it unless Development,
  local login, `PEAKS_SANDBOX=1`, and the Compose `sql/PeaksSandbox` database
  are configured. All MCP/OAuth/discovery paths return 404 when disabled.
- HTTPS, the exact configured issuer host/port, and same-origin browser requests
  are enforced. Public issuers require explicit ngrok mode and an ngrok domain.
  Dynamic registration accepts at most four loopback or explicitly allowed
  ChatGPT callbacks and caps stored clients at 100. Registration itself grants
  no data access. The public demo uses passwordless fictional users, so anyone
  who reaches it can sign in as a sandbox user. Stop the tunnel after rehearsals.
- OpenIddict issues opaque reference tokens with S256 PKCE. Access tokens last
  at most 15 minutes; refresh rotates and cannot extend the original eight-hour
  consent window. Every request validates persisted token and authorization state.
- OAuth records use a separate SQLite database in the disposable sandbox key
  volume. The existing PEAKS SQL schema and migrations are unchanged. Keys and
  credentials survive container restart; deleting the volumes invalidates them.
- Each tool reads fresh PEAKS permissions for the token's subject. System admins,
  Sandbox Team departmental admins, and equipment managers can read inventory.
  The tool schema exposes no team or user-identity override. The team is always
  `sandbox`; cross-team person IDs are rejected. The legacy API-key middleware
  does not run on MCP or OAuth routes.
- Tools read active equipment and active people, return bounded results with
  truncation indicators, and expose no writes, messages, or external-service calls.
  Pending assignments remain visible and are marked unconfirmed. Overdue loans
  remain assigned until the application unassigns them.
- Consent/revocation require browser cookies and antiforgery tokens; browser
  cookies alone cannot call MCP. Token, OAuth state, and tool-content logging
  are suppressed. In-flight responses authorized before revocation can finish.

Run the protocol and permission tests with:

```bash
dotnet test Test -c Release --filter FullyQualifiedName~McpDemoTests
```

Use `bash scripts/mcp-demo.sh status`, `logs`, and `stop` to manage this sandbox.
`stop` retains its data. This local demonstration is not a production MCP rollout.

## Validation on November 12, 2026

- Full .NET suite: 273 passed, 13 skipped. The skipped SQL integration cases
  require a separately configured test database; they were not run.
- The 12 MCP cases cover PKCE, resource binding, code/refresh replay, denied
  consent, refresh, revocation, current permissions, grant ownership, team
  isolation, bounded queries, and disabled/unsafe configurations.
- Docker built and became healthy. Trusted HTTPS worked without bypasses.
- Codex CLI 0.154.0 installed plugin 0.1.4, completed browser consent, discovered
  all five tools, and called each against the live SQL sandbox. Results included
  three loans due this week, four Apple devices for Javier Morales, and fourteen
  unassigned devices. Browser inventory matched the three demo loans.
- The connection survived an app-container restart. Browser revocation caused
  Codex's next MCP call to fail authentication. A fresh authorized connection
  was established and all five tools succeeded again.
- Refresh rotation and second-user denial were exercised in the protocol tests,
  not as separate live browser sessions. No Entra, CAS, production deployment,
  or natural-language model turn was tested.

## Public tunnel validation on November 16, 2026

- All 25 MCP tests passed, including public issuer configuration, exact hosted
  callbacks, issuer identification, discovery, PKCE, and existing permission and
  revocation cases. Shell syntax and `git diff --check` passed.
- Docker rebuilt and became healthy. Through ngrok, both metadata documents and
  the login page returned 200. Unauthenticated `/mcp` returned 401 with the public
  protected-resource metadata URL. Upstream TLS verification remained enabled.
- Two live HTTP protocol rehearsals against the public origin completed DCR,
  fictional user login, consent, PKCE code exchange, discovery of five tools,
  people/equipment/expiry queries, refresh rotation, revocation and logout.
  Both returned four Apple devices for Javier and 15 assignments due in the
  Pacific week November 16 through November 22. Revocation blocked both access
  tokens and the rotated refresh token. Rehearsal grants were revoked afterward.
- The user confirmed that the real Codex connection and demo work after using
  the custom-server form. PEAKS Demo tools then became available in this chat.
  Direct calls through that installed MCP returned the current demo context,
  resolved Javier Morales to person ID 3, and returned his four Apple devices.
  A complete remove/re-add cycle in the Codex UI has not been separately observed.
  The earlier public HTTP rehearsals above used a protocol client.

The one-command launcher was exercised against the running sandbox and tunnel.
It reused the existing ngrok process, synchronized the issuer, refreshed fixture
dates and passed public endpoint checks. The installed PEAKS Demo MCP still
returned the current context afterward. Four launcher tests cover the ngrok ready
event, early process failure/cleanup, refusing an unrelated tunnel and detecting
a stale issuer challenge. A new live ngrok session and Docker Desktop cold start
were not exercised during this check, to preserve the connected demo URL.

```bash
python3 -m unittest discover -s scripts -p 'test_mcp_demo_launch.py' -v
```
