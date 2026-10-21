#!/usr/bin/env bash
set -euo pipefail
if [[ $# != 1 ]]; then
  echo "Usage: $0 MigrationName" >&2
  exit 1
fi
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"
dotnet tool restore
dotnet restore Keas.Mvc
dotnet ef migrations add "$1" --project Keas.Core --startup-project Keas.Mvc --configuration Release
