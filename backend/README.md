# BranchBrew ERP — Backend

NestJS API for a multi-branch coffee-shop ERP: point of sale, kitchen display, inventory and batch tracking, procurement, production/BOM, HR and payroll, CRM loyalty, and double-entry accounting.

Part of the [BranchBrew monorepo](../). See [`docs/architecture.md`](../docs/architecture.md) for the system deep dive, [`docs/demo.md`](../docs/demo.md) for a guided demo, and [`infra/README.md`](../infra/README.md) for Docker/deployment.

## Stack

- **NestJS 11** (feature-module architecture) on **Node 22**
- **Prisma 7** + **PostgreSQL**
- **Passport JWT** over httpOnly cookies, with token-version revocation
- **socket.io** WebSocket gateway for real-time KDS updates
- **@nestjs/event-emitter** + a transactional outbox for reliable post-commit side effects
- **class-validator** DTOs, **Swagger** contract export, **Jest** unit + e2e

## Setup

```bash
npm install                 # from the monorepo root
cp .env.example .env         # then fill DATABASE_URL, JWT_SECRET, CORS_ORIGIN
npm run migrate:deploy       # apply migrations
npm run db:seed              # optional: load demo data
npm run start:dev            # http://localhost:3000
```

> [!CAUTION]
> `npm run db:seed` wipes the target database before loading demo data. Check `DATABASE_URL` before running it.

## Tests

```bash
npm run test         # unit tests (Jest)
npm run test:e2e     # e2e tests against a test database
npm run test:cov     # coverage
```

## API documentation

- Swagger UI at `http://localhost:3000/docs` (development only)
- `openapi.json` is committed and regenerated with `npm run openapi:export`; the frontend generates its typed client from it, and CI fails on drift.
- Health check at `GET /health`.
