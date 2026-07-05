#!/bin/sh
set -eu

cd /app

export NODE_ENV=development

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set"
  exit 1
fi

if [ "${FORCE_SEED:-0}" != "1" ]; then
  count="$(node -e "
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    pool
      .query('SELECT COUNT(*)::int AS c FROM \"User\"')
      .then((r) => {
        process.stdout.write(String(r.rows[0].c));
        return pool.end();
      })
      .catch((err) => {
        console.error(err.message);
        process.exit(2);
      });
  ")"

  if [ "${count:-0}" -gt 0 ]; then
    echo "==> Database already has ${count} user(s); skipping demo seed (use npm run docker:seed to reseed)"
    exit 0
  fi
fi

echo "==> Running demo seed"
npm run db:seed --workspace=backend
