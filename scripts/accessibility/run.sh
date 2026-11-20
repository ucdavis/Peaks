#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
root=$(git rev-parse --show-toplevel)
mkdir -p "$root/artifacts/accessibility"
export PILOT_OUTPUT
PILOT_OUTPUT=$(mktemp -d "$root/artifacts/accessibility/run-XXXXXXXX")
export SANDBOX_PROJECT="peaks-a11y-$(basename "$PILOT_OUTPUT" | tr '[:upper:]' '[:lower:]')-$$"
export SANDBOX_PORT=0 SANDBOX_SQL_PORT=0
compose=(docker compose -p "$SANDBOX_PROJECT" -f "$root/.devcontainer/docker-compose.sandbox.yml")
phase=dependencies
started_sandbox=false

finish() {
  status=$?
  set +e
  if "$started_sandbox"; then
    if [[ $status != 0 ]]; then
      "${compose[@]}" ps -a > "$PILOT_OUTPUT/containers.txt"
      "${compose[@]}" logs --no-color --tail=100 > "$PILOT_OUTPUT/sandbox.log"
    fi
    "${compose[@]}" down -v --rmi local
    teardown_status=$?
    if [[ $teardown_status != 0 ]]; then
      echo "Sandbox teardown failed with exit $teardown_status" | tee -a "$PILOT_OUTPUT/run.txt"
      if [[ $status == 0 ]]; then
        status=$teardown_status
        phase=teardown
      fi
    fi
  fi
  if [[ $status != 0 && $phase != teardown ]]; then
    echo "Pilot incomplete during $phase" | tee -a "$PILOT_OUTPUT/run.txt"
  fi
  echo "Last phase $phase, exit $status, elapsed ${SECONDS}s" | tee -a "$PILOT_OUTPUT/run.txt"
  echo "Report directory: $PILOT_OUTPUT"
  exit "$status"
}
trap finish EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

export PILOT_COMMIT PILOT_CHECKOUT
PILOT_COMMIT=$(git rev-parse HEAD)
changes=$(git --no-optional-locks status --porcelain --untracked-files=normal)
PILOT_CHECKOUT=clean
if [[ -n $changes ]]; then
  PILOT_CHECKOUT=dirty
fi
echo "Commit $PILOT_COMMIT, checkout $PILOT_CHECKOUT, environment ${AGENT_OS:-local}, project $SANDBOX_PROJECT" | tee "$PILOT_OUTPUT/run.txt"
npm ci --no-audit --no-fund
npx playwright install --only-shell chromium
echo "Dependencies ready at ${SECONDS}s" | tee -a "$PILOT_OUTPUT/run.txt"

phase=sandbox
started_sandbox=true
"${compose[@]}" up --build -d --wait --wait-timeout 300 > "$PILOT_OUTPUT/build.log" 2>&1 || {
  tail -50 "$PILOT_OUTPUT/build.log"
  exit 1
}
export PILOT_URL
PILOT_URL="http://$("${compose[@]}" port app 8080)"
echo "Seeded sandbox ready at ${SECONDS}s" | tee -a "$PILOT_OUTPUT/run.txt"
phase=coverage
npm test
phase=complete
