# BranchBrew ERP — Frontend

Next.js App Router UI for the BranchBrew coffee-shop ERP: POS terminal, kitchen display (KDS), dashboard, inventory, procurement, HR, finance, and CRM.

Part of the [BranchBrew monorepo](../). See [`docs/demo.md`](../docs/demo.md) for a guided walkthrough with demo logins, and [`docs/design-system.md`](../docs/design-system.md) for the design-token architecture and UI conventions.

## Stack

- **Next.js 16** (App Router) + **React 19** on **Node 22**
- **TanStack Query 5** for server state
- **Ant Design 6** + **Tailwind CSS 4**
- **socket.io-client** for real-time KDS
- Typed API client generated from the backend's OpenAPI schema
- **Vitest** unit tests, **Playwright** e2e

## Setup

```bash
npm install                 # from the monorepo root
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL (defaults to http://localhost:3000)
npm run dev                  # http://localhost:3001
```

The backend must be running (see [`../backend/README.md`](../backend/README.md)).

## API types

The client types in `src/types/generated/api.d.ts` are generated from the backend contract — do not edit by hand:

```bash
npm run generate:api         # reads ../backend/openapi.json
```

## Tests

```bash
npm run test         # unit tests (Vitest)
npm run test:cov     # coverage
npm run test:e2e     # end-to-end (Playwright)
```
