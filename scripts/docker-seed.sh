#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ -f infra/.env.compose ]]; then
  set -a
  # shellcheck disable=SC1091
  source infra/.env.compose
  set +a
fi

POSTGRES_USER="${POSTGRES_USER:-erp_user}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-erp_password}"
POSTGRES_DB="${POSTGRES_DB:-erp_db}"
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"

export DATABASE_URL="${DATABASE_URL:-postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public}"

echo "==> Prisma generate (host)"
(cd backend && npx prisma generate)

echo "==> Seeding demo data into ${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"
npm run db:seed --workspace=backend
