#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="${COMPOSE_FILE:-infra/docker-compose.yml}"
ENV_FILE="${ENV_FILE:-infra/.env.compose.ci}"
COMPOSE=(docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE")
PROJECT="${COMPOSE_PROJECT_NAME:-erp-ci-smoke}"

cleanup() {
  COMPOSE_PROJECT_NAME="$PROJECT" "${COMPOSE[@]}" down -v --remove-orphans >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

wait_for_url() {
  local url="$1"
  local label="$2"
  for _ in $(seq 1 60); do
    if curl -sf "$url" >/dev/null; then
      echo "$label ready"
      return 0
    fi
    sleep 2
  done
  echo "$label failed to become ready: $url"
  COMPOSE_PROJECT_NAME="$PROJECT" "${COMPOSE[@]}" ps
  COMPOSE_PROJECT_NAME="$PROJECT" "${COMPOSE[@]}" logs --tail=80
  return 1
}

echo "==> Validating compose config"
JWT_SECRET=test-jwt-secret-for-ci-only-32chars \
  POSTGRES_USER=erp_user \
  POSTGRES_PASSWORD=erp_password \
  POSTGRES_DB=erp_db \
  NEXT_PUBLIC_API_URL=http://localhost:3000 \
  docker compose -f infra/docker-compose.yml config --quiet

JWT_SECRET=test-jwt-secret-for-ci-only-32chars \
  CORS_ORIGIN=https://example.com \
  DATABASE_URL=postgresql://erp_user:erp_password@db:5432/erp_db?schema=public \
  NEXT_PUBLIC_API_URL=https://example.com \
  POSTGRES_USER=erp_user \
  POSTGRES_PASSWORD=erp_password \
  POSTGRES_DB=erp_db \
  docker compose -f infra/docker-compose.prod.yml config --quiet

echo "==> Starting stack (project: $PROJECT)"
export COMPOSE_PROJECT_NAME="$PROJECT"
"${COMPOSE[@]}" up -d --build

wait_for_url "http://localhost:3000/health" "Backend"
wait_for_url "http://localhost:3001/api/health" "Frontend"

echo "==> Smoke checks passed"
