# PEAKS local MCP presentation demo

This branch adds a read-only MCP adapter to the Docker sandbox. Codex runs the
MCP connection on the same computer and calls `https://localhost:5446/mcp`.
No public tunnel, Entra registration, or cloud deployment is needed.

The browser uses PEAKS' existing fictional local users. This demonstrates real
OAuth authorization, PKCE, consent, refresh, and revocation. It does not
demonstrate Entra or CAS authentication. Mailbroker can supply that separate
example in the presentation.

## Start and connect

1. Start Docker Desktop. Install .NET 10 and ensure `dotnet dev-certs https --check --trust`
   succeeds. If needed, use `dotnet dev-certs https --trust` and complete the OS prompt.
2. Run `bash scripts/mcp-demo.sh start`. It builds this checkout and starts only
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

## Explain the connection

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
does not move due dates forward. Before a later presentation, update the three
`MCP-DEMO-*` loan dates through the PEAKS UI, or reset the disposable database.
To refresh all fixture dates, stop the demo and
remove only this project's volumes with the two Compose files and
`SANDBOX_PROJECT=peaks-mcp-demo`; then start it again. This erases demo inventory,
consents, and credentials, so reconnect the plugin afterward.

## Implementation boundaries

- `McpDemo:Enabled` defaults off. Startup rejects it unless Development,
  local login, `PEAKS_SANDBOX=1`, and the Compose `sql/PeaksSandbox` database
  are configured. All MCP/OAuth/discovery paths return 404 when disabled.
- HTTPS, the exact localhost host/port, and same-origin browser requests are
  enforced. Dynamic registration accepts at most four loopback callbacks and
  caps stored clients at 100. Registration itself grants no data access.
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
