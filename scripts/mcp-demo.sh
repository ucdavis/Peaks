#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export SANDBOX_PROJECT=peaks-mcp-demo
export SANDBOX_PORT=5286
export SANDBOX_SQL_PORT=14340
export MCP_DEMO_HTTPS_PORT=5446
compose=(docker compose -f .devcontainer/docker-compose.sandbox.yml -f .devcontainer/docker-compose.mcp-demo.yml)
case "${1:-status}" in
  start)
    dotnet dev-certs https --check --trust
    mkdir -p .local/mcp
    chmod 700 .local/mcp
    dotnet dev-certs https --export-path "$PWD/.local/mcp/localhost.pfx" --password peaks-local-demo
    chmod 600 .local/mcp/localhost.pfx
    "${compose[@]}" up --build -d --wait --wait-timeout 240
    printf 'PEAKS demo: https://localhost:5446/oauth/connections\n'
    ;;
  stop) "${compose[@]}" down ;;
  connect)
    codex plugin marketplace add "$PWD"
    codex plugin add peaks@peaks-demo
    codex mcp login peaks --scopes peaks.inventory.read,offline_access --oauth-client-registration dcr
    ;;
  status) "${compose[@]}" ps ;;
  logs) "${compose[@]}" logs --tail=60 app ;;
  *) printf 'Usage: %s {start|connect|stop|status|logs}\n' "$0" >&2; exit 2 ;;
esac
