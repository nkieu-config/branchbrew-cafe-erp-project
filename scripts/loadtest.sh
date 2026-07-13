#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

RATE="${RATE:-5}"
DURATION="${DURATION:-60s}"
BASE_URL="${BASE_URL:-http://localhost:3000}"
if [ -f infra/.env.compose ]; then
  set -a
  # shellcheck disable=SC1091
  . infra/.env.compose
  set +a
fi

DB_USER="${POSTGRES_USER:-erp_user}"
DB_PASSWORD="${POSTGRES_PASSWORD:-erp_password}"
DB_NAME="${POSTGRES_DB:-erp_db}"
DB_PORT="${POSTGRES_PORT:-5432}"
export DATABASE_URL="${DATABASE_URL:-postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}?schema=public}"

if ! command -v k6 >/dev/null 2>&1; then
  echo "k6 is not installed. Install it with: brew install k6" >&2
  exit 1
fi

if [ ! -f loadtest/target.json ]; then
  echo "loadtest/target.json is missing. Run: npm run loadtest:stock" >&2
  exit 1
fi

START="$(date -u +%Y-%m-%dT%H:%M:%S.000Z)"

echo "Load test: ${RATE} orders/sec for ${DURATION} against ${BASE_URL}"
echo "Window starts at ${START}"
echo

RATE="$RATE" DURATION="$DURATION" BASE_URL="$BASE_URL" \
  k6 run --env "RATE=$RATE" --env "DURATION=$DURATION" --env "BASE_URL=$BASE_URL" loadtest/checkout.js

echo
echo "Checkout finished. Now measuring how long the outbox takes to apply the side effects."
echo

SINCE="$START" WAIT_FOR_DRAIN=true npm run loadtest:lag
