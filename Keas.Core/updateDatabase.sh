#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"
# Explicit target identity and --apply are required. No user secrets are loaded.
dotnet run --project Keas.DbTool --configuration Release -- migrate "$@"
