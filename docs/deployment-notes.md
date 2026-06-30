# Deployment Notes

This project is intended to support two deployment paths:

- **Portfolio production demo:** Vercel (frontend) + Railway/Render (backend) + Supabase Postgres.
- **Local reviewer demo:** Docker Compose with the bundled Postgres container.

## Supabase

Use separate database URLs:

- `DATABASE_URL`: Supabase transaction pooler, used by the running backend.
- `DIRECT_URL`: Supabase direct/session connection, used by Prisma migrations.

Deploy order:

1. Set backend secrets from `.env.supabase.example`.
2. Run `npm run migrate:deploy --workspace=backend`.
3. Start backend with `npm run start:prod --workspace=backend`.
4. Seed only a disposable demo database, and only with:
   `ALLOW_DEMO_SEED=true DEMO_SEED_CONFIRM=WIPE_DEMO_DATABASE`.

## Frontend API URLs

- `NEXT_PUBLIC_API_URL` is the public browser-facing backend URL.
- `INTERNAL_API_URL` is optional and only needed when Next.js server-side code must call a private backend URL, such as Docker Compose service networking.

## Docker Compose

`docker-compose.yml` is for local full-stack demos. It intentionally includes Postgres so reviewers can run the project without creating a Supabase account.

For Docker deployments that use Supabase, keep the local compose file unchanged and add a separate override file later, for example `docker-compose.supabase.yml`.
