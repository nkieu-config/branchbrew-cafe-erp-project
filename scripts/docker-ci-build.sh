#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:3000}"
BUILD_RETRIES="${BUILD_RETRIES:-3}"
BUILD_RETRY_DELAY="${BUILD_RETRY_DELAY:-15}"

# Separate GHA cache scopes so parallel buildx runs do not race on cache export.
CACHE_BACKEND_FROM="${CACHE_BACKEND_FROM:-type=gha,scope=erp-backend}"
CACHE_BACKEND_TO="${CACHE_BACKEND_TO:-type=gha,scope=erp-backend,mode=max}"
CACHE_FRONTEND_FROM="${CACHE_FRONTEND_FROM:-type=gha,scope=erp-frontend}"
CACHE_FRONTEND_TO="${CACHE_FRONTEND_TO:-type=gha,scope=erp-frontend,mode=max}"

build_with_retry() {
  local attempt
  for attempt in $(seq 1 "$BUILD_RETRIES"); do
    if "$@"; then
      return 0
    fi
    if [ "$attempt" -lt "$BUILD_RETRIES" ]; then
      echo "Build failed (attempt ${attempt}/${BUILD_RETRIES}), retrying in ${BUILD_RETRY_DELAY}s..."
      sleep "$BUILD_RETRY_DELAY"
    fi
  done
  echo "Build failed after ${BUILD_RETRIES} attempts"
  return 1
}

echo "==> Building backend (production) and frontend images in parallel"
build_with_retry docker buildx build \
  --file backend/Dockerfile \
  --target production \
  --tag erp-backend:ci \
  --load \
  --cache-from "$CACHE_BACKEND_FROM" \
  --cache-to "$CACHE_BACKEND_TO" \
  . &
BACKEND_PID=$!

build_with_retry docker buildx build \
  --file frontend/Dockerfile \
  --tag erp-frontend:ci \
  --build-arg "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL" \
  --load \
  --cache-from "$CACHE_FRONTEND_FROM" \
  --cache-to "$CACHE_FRONTEND_TO" \
  . &
FRONTEND_PID=$!

BACKEND_STATUS=0
FRONTEND_STATUS=0
wait "$BACKEND_PID" || BACKEND_STATUS=$?
wait "$FRONTEND_PID" || FRONTEND_STATUS=$?

if [ "$BACKEND_STATUS" -ne 0 ] || [ "$FRONTEND_STATUS" -ne 0 ]; then
  echo "==> Parallel build failed (backend=${BACKEND_STATUS}, frontend=${FRONTEND_STATUS})"
  exit 1
fi

echo "==> Backend production and frontend images ready"

echo "==> Building backend migrate image (reuses backend layer cache)"
build_with_retry docker buildx build \
  --file backend/Dockerfile \
  --target migrate \
  --tag erp-backend-migrate:ci \
  --load \
  --cache-from "$CACHE_BACKEND_FROM" \
  --cache-to "$CACHE_BACKEND_TO" \
  .

echo "==> All CI images built"
