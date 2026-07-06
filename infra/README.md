# Infrastructure & Deployment

Compose files, environment templates, and deployment reference for BranchBrew ERP — local Docker stack, production modes (managed or bundled Postgres), and optional TLS for self-hosted VPS.

## Quick start (local)

```bash
cp infra/.env.compose.example infra/.env.compose
npm run docker:up
```

Demo data is seeded automatically on first startup (empty database). To reset demo data:

```bash
npm run docker:seed
```

Open http://localhost:3001/login — demo login `manager@branchbrew.dev` / `password123`.

## Commands

| Script | Purpose |
|--------|---------|
| `npm run docker:up` | Build and start db, migrate, backend, frontend |
| `npm run docker:down` | Stop the local stack |
| `npm run docker:seed` | Wipe and reload demo data (runs seed container with `FORCE_SEED=1`) |
| `npm run docker:up:prod` | Production-oriented compose (`docker-compose.prod.yml`) |

## Environment files

All env templates live in `infra/` because they are used by Compose, not by `backend/.env` (local Nest dev).

| File | Committed | Who uses it |
|------|-----------|-------------|
| `.env.compose.example` | yes | **Developers** — copy to `.env.compose` for local Docker |
| `.env.compose` | no (gitignored) | Your local secrets; read by `docker:up` / `docker:down` / `docker:seed` |
| `.env.compose.ci` | yes | **CI only** — `scripts/docker-compose-smoke.sh` on GitHub Actions |
| `.env.supabase.example` | yes | **Deploy reference** — Supabase / hosted production variable names |

### `.env.compose.example` → `.env.compose`

For local stack (`docker-compose.yml`): Postgres credentials, `JWT_SECRET`, `NEXT_PUBLIC_API_URL`.

```bash
cp infra/.env.compose.example infra/.env.compose
```

### `.env.compose.ci`

Do not copy or edit for daily dev. Fixed non-production values so CI can run `docker compose up` and smoke tests without a private env file.

### `.env.supabase.example`

Not copied directly for `docker:up`. Use it when:

- Filling **hosting provider secrets** (Railway, Fly, VPS, etc.), or
- Building `infra/.env.compose` for `npm run docker:up:prod` with external Postgres (Supabase)

Production vars include `DATABASE_URL` (pooler), `DIRECT_URL` (migrations), `CORS_ORIGIN`, and `JWT_SECRET` (≥ 32 chars).

## Compose files

| File | Use |
|------|-----|
| `docker-compose.yml` | Local stack — backend dev image (Swagger on), bundled Postgres |
| `docker-compose.prod.yml` | Production-like — resource limits, production images, managed Postgres by default |
| `docker-compose.caddy.yml` | Optional TLS overlay (Caddy + Let's Encrypt) for self-hosted VPS deploys |
| `docker-compose.ci-smoke.yml` | CI smoke stack from pre-built `erp-*:ci` images |

### Postgres access

The database sits on an internal-only Docker network — it has **no host port** (published
ports do not work on internal networks, and the demo stack never needs one). To reach psql:

```bash
docker compose -f infra/docker-compose.yml --env-file infra/.env.compose exec db \
  psql -U erp_user erp_db
```

### Production database modes

`docker-compose.prod.yml` defaults to a **managed Postgres** (Supabase — set `DATABASE_URL`/`DIRECT_URL`);
only migrate/backend/frontend start. For a self-hosted all-in-one stack, opt in to the bundled Postgres:

```bash
docker compose -f infra/docker-compose.prod.yml --profile local-db \
  --env-file infra/.env.compose up --build
```

(with `DATABASE_URL=postgresql://user:password@db:5432/erp_db?schema=public`)

### TLS on a VPS (optional)

PaaS platforms (Vercel/Railway/Fly) terminate TLS themselves. For a bare VPS, stack the Caddy overlay:

```bash
DEMO_DOMAIN=demo.example.com API_DOMAIN=api.example.com \
BACKEND_PORT=127.0.0.1:3000 FRONTEND_PORT=127.0.0.1:3001 \
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.caddy.yml \
  --env-file infra/.env.compose up -d --build
```

`BACKEND_PORT`/`FRONTEND_PORT` bound to loopback keep the app ports off the public internet;
Caddy provisions Let's Encrypt certificates for both domains automatically.

## Notes

- Migrations run automatically via the one-shot `migrate` service.
- Demo seed runs automatically via the one-shot `seed` service when the database has no users.
- `docker:seed` re-runs demo seed inside the Docker network (no host Postgres port required).
- API: http://localhost:3000 — Swagger (dev image): http://localhost:3000/docs
