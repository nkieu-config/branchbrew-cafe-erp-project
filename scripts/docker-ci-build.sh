#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

CACHE_FROM="${CACHE_FROM:-type=gha}"
CACHE_TO="${CACHE_TO:-type=gha,mode=max}"
NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:3000}"

echo "==> Building backend (production) and frontend images in parallel"
docker buildx build \
  --file backend/Dockerfile \
  --target production \
  --tag erp-backend:ci \
  --load \
  --cache-from "$CACHE_FROM" \
  --cache-to "$CACHE_TO" \
  . &
BACKEND_PID=$!

docker buildx build \
  --file frontend/Dockerfile \
  --tag erp-frontend:ci \
  --build-arg "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL" \
  --load \
  --cache-from "$CACHE_FROM" \
  --cache-to "$CACHE_TO" \
  . &
FRONTEND_PID=$!

wait "$BACKEND_PID"
echo "==> Backend production image ready"

echo "==> Building backend migrate image (reuses backend layer cache)"
docker buildx build \
  --file backend/Dockerfile \
  --target migrate \
  --tag erp-backend-migrate:ci \
  --load \
  --cache-from "$CACHE_FROM" \
  --cache-to "$CACHE_TO" \
  .

wait "$FRONTEND_PID"
echo "==> Frontend image ready"
echo "==> All CI images built"
