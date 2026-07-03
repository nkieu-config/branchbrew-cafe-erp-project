#!/usr/bin/env bash
# Retry npm ci on transient registry/network failures (common on GitHub Actions).
set -euo pipefail

MAX_ATTEMPTS="${NPM_CI_MAX_ATTEMPTS:-3}"
RETRY_DELAY_SECONDS="${NPM_CI_RETRY_DELAY_SECONDS:-15}"

for attempt in $(seq 1 "$MAX_ATTEMPTS"); do
  if npm ci --prefer-offline; then
    exit 0
  fi

  echo "npm ci failed (attempt ${attempt}/${MAX_ATTEMPTS})"
  if [ "$attempt" -eq "$MAX_ATTEMPTS" ]; then
    exit 1
  fi

  sleep "$((attempt * RETRY_DELAY_SECONDS))"
done
