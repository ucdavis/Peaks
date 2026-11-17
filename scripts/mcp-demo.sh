#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export SANDBOX_PROJECT=peaks-mcp-demo
export SANDBOX_PORT=5286
export SANDBOX_SQL_PORT=14340
export MCP_DEMO_HTTPS_PORT=5446
umask 077
mkdir -p .local/mcp
compose=(docker compose)
if [[ -f .local/mcp/mode.env ]]; then compose+=(--env-file .local/mcp/mode.env); fi
compose+=(-f .devcontainer/docker-compose.sandbox.yml -f .devcontainer/docker-compose.mcp-demo.yml)
case "${1:-status}" in
  demo)
    shift
    exec python3 scripts/mcp-demo-launch.py "$@"
    ;;
  check) exec python3 scripts/mcp-demo-launch.py --check ;;
  resume)
    if [[ ! -f .local/mcp/localhost.pfx ]]; then
      printf 'Run bash scripts/mcp-demo.sh start once to build and prepare the certificate.\n' >&2
      exit 1
    fi
    "${compose[@]}" up --no-build --pull never -d --wait --wait-timeout 240
    ;;
  start)
    dotnet dev-certs https --check --trust
    mkdir -p .local/mcp
    chmod 700 .local/mcp
    dotnet dev-certs https --export-path "$PWD/.local/mcp/localhost.pfx" --password peaks-local-demo
    chmod 600 .local/mcp/localhost.pfx
    "${compose[@]}" up --build -d --wait --wait-timeout 240
    printf 'PEAKS is running. For the custom-server form, run tunnel, then public in another terminal.\n'
    ;;
  tunnel)
    openssl pkcs12 -in .local/mcp/localhost.pfx -passin pass:peaks-local-demo -clcerts -nokeys -out .local/mcp/localhost.crt
    # Preserve the public Host header. TLS to Kestrel avoids trusting forwarded headers.
    exec ngrok http https://localhost:5446 --inspect=false --upstream-tls-verify \
      --upstream-tls-verify-cas "$PWD/.local/mcp/localhost.crt"
    ;;
  public)
    python3 - "${2:-}" <<'PY'
import json, pathlib, re, sys, urllib.request
with urllib.request.urlopen('http://127.0.0.1:4040/api/tunnels', timeout=5) as response:
    tunnels = json.load(response)['tunnels']
matches = [t for t in tunnels if t['config']['addr'] == 'https://localhost:5446'
           and t['public_url'].startswith('https://') and t['config']['inspect'] is False]
if len(matches) != 1:
    sys.exit('Start exactly one demo tunnel with inspection disabled: bash scripts/mcp-demo.sh tunnel')
origin = matches[0]['public_url'].rstrip('/')
if not re.fullmatch(r'https://[a-z0-9-]+\.(?:ngrok-free\.app|ngrok-free\.dev|ngrok\.app|ngrok\.dev)', origin):
    sys.exit('Expected an ngrok HTTPS origin.')
callback = sys.argv[1]
if not callback and pathlib.Path('.local/mcp/mode.env').exists():
    saved = dict(line.split('=', 1) for line in pathlib.Path('.local/mcp/mode.env').read_text().splitlines() if '=' in line)
    callback = saved.get('MCP_DEMO_CHATGPT_REDIRECT_URI', '')
if callback and not re.fullmatch(r'https://chatgpt\.com/(?:connector_platform_oauth_redirect|connector/oauth/[A-Za-z0-9_-]+)', callback):
    sys.exit('Pass the exact ChatGPT callback URL from the form, without query parameters.')
pathlib.Path('.local/mcp/mode.env').write_text(
    f'MCP_DEMO_ISSUER={origin}/\nMCP_DEMO_ALLOW_NGROK=true\nMCP_DEMO_CHATGPT_REDIRECT_URI={callback}\n')
print(f'Server URL: {origin}/mcp\nConnections: {origin}/oauth/connections\nSign out: {origin}/logout')
PY
    docker compose --env-file .local/mcp/mode.env -f .devcontainer/docker-compose.sandbox.yml \
      -f .devcontainer/docker-compose.mcp-demo.yml up -d --no-deps --wait --wait-timeout 90 app
    ;;
  local)
    printf 'MCP_DEMO_ISSUER=https://localhost:5446/\nMCP_DEMO_ALLOW_NGROK=false\n' > .local/mcp/mode.env
    docker compose --env-file .local/mcp/mode.env -f .devcontainer/docker-compose.sandbox.yml \
      -f .devcontainer/docker-compose.mcp-demo.yml up -d --no-deps --wait --wait-timeout 90 app
    ;;
  refresh-dates)
    "${compose[@]}" exec -T -e PEAKS_MCP_DEMO=1 -e PEAKS_MCP_REFRESH_DATES=1 app \
      dotnet /app/app/Keas.Mvc.dll database seed-sandbox
    ;;
  stop) "${compose[@]}" down ;;
  connect)
    codex plugin marketplace add "$PWD"
    codex plugin add peaks@peaks-demo
    codex mcp login peaks --scopes peaks.inventory.read,offline_access --oauth-client-registration dcr
    ;;
  status)
    "${compose[@]}" ps
    if [[ -f .local/mcp/mode.env ]]; then cat .local/mcp/mode.env; fi
    ;;
  logs) "${compose[@]}" logs --tail=60 app ;;
  *) printf 'Usage: %s {demo [--build]|check|start|resume|tunnel|public [exact-chatgpt-callback]|local|refresh-dates|connect|stop|status|logs}\n' "$0" >&2; exit 2 ;;
esac
