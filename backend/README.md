# BranchBrew ERP — Backend

NestJS API for a multi-branch coffee-shop ERP: point of sale, kitchen display, inventory and batch tracking, procurement, production/BOM, HR and payroll, CRM loyalty, and double-entry accounting.

Part of the [BranchBrew monorepo](../). See [`docs/demo.md`](../docs/demo.md) for a guided demo and [`infra/README.md`](../infra/README.md) for Docker/deployment.

## Stack

- **NestJS 11** (feature-module architecture) on **Node 22**
- **Prisma 7** + **PostgreSQL**
- **Passport JWT** over httpOnly cookies, with token-version revocation
- **socket.io** WebSocket gateway for real-time KDS updates
- **@nestjs/event-emitter** + a transactional outbox for reliable post-commit side effects
- **class-validator** DTOs, **Swagger** contract export, **Jest** unit + e2e

## Architecture highlights

- **Transactional outbox** — domain events (order placed, PO received, production completed) are written in the same transaction as the business data, then dispatched to handlers (accounting, notifications, KDS) so side effects never desync from committed state.
- **Event-driven accounting** — every sale, refund, receipt, and production run posts a balanced double-entry journal, with money handled as `Prisma.Decimal` (no float math).
- **Branch-scoped RBAC** — `SUPER_ADMIN` sees all branches; managers and staff are scoped to their branch via a shared authorization primitive.
- **FEFO inventory** — batch deduction is first-expired-first-out, with DB-level `CHECK (stock >= 0)` guards.

## Setup

```bash
npm install                 # from the monorepo root
cp .env.example .env         # then fill DATABASE_URL, JWT_SECRET, CORS_ORIGIN
npm run migrate:deploy       # apply migrations
npm run db:seed              # optional: load demo data (wipes the target DB)
npm run start:dev            # http://localhost:3000
```

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
