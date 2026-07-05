#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="${ENV_FILE:-infra/.env.compose}"
COMPOSE=(docker compose -f infra/docker-compose.yml --env-file "$ENV_FILE")

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing ${ENV_FILE}. Copy infra/.env.compose.example first."
  exit 1
fi

echo "==> Reseeding demo data (runs inside Docker network; FORCE_SEED=1)"
"${COMPOSE[@]}" run --rm -e FORCE_SEED=1 seed
