#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/postgres}"
export JWT_SECRET="${JWT_SECRET:-test-jwt-secret-for-ci-only-32chars}"
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:3000}"
export PLAYWRIGHT_BASE_URL="${PLAYWRIGHT_BASE_URL:-http://localhost:3001}"
export PLAYWRIGHT_SKIP_WEBSERVER=1
export E2E_EMAIL="${E2E_EMAIL:-manager@branchbrew.dev}"
export E2E_ADMIN_EMAIL="${E2E_ADMIN_EMAIL:-admin@branchbrew.dev}"
export E2E_PASSWORD="${E2E_PASSWORD:-password123}"

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  if [[ -n "$FRONTEND_PID" ]]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  if [[ -n "$BACKEND_PID" ]]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

wait_for_url() {
  local url="$1"
  local label="$2"
  for _ in $(seq 1 60); do
    if curl -sf "$url" > /dev/null; then
      echo "$label ready"
      return 0
    fi
    sleep 2
  done
  echo "$label failed to start"
  return 1
}

echo "==> Installing dependencies (if needed)"
npm ci --prefer-offline

echo "==> Building backend"
npm run build --workspace=backend

echo "==> Building frontend (production — matches CI)"
NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" npm run build --workspace=frontend
test -f frontend/.next/BUILD_ID

echo "==> Preparing database"
npx prisma generate --schema=backend/prisma/schema.prisma
npm run migrate
npm run db:seed

echo "==> Starting backend"
node backend/dist/src/main.js &
BACKEND_PID=$!
wait_for_url "http://localhost:3000/health" "Backend"

echo "==> Starting frontend"
npm run start --workspace=frontend -- -p 3001 &
FRONTEND_PID=$!
wait_for_url "http://localhost:3001/login" "Frontend"

echo "==> Running Playwright (CI mode)"
npm run test:e2e:frontend
