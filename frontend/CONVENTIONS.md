# Frontend Conventions

Permanent reference for file organization, naming, and patterns in this Next.js app.
When adding or moving code, follow these rules. When refactoring legacy code, migrate toward them.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · TanStack Query · Ant Design + shadcn/ui · Vitest · Playwright

---

## Table of contents

1. [Directory layout](#1-directory-layout)
2. [File naming](#2-file-naming)
3. [App Router & pages](#3-app-router--pages)
4. [Components](#4-components)
5. [Hooks & data fetching](#5-hooks--data-fetching)
6. [Lib utilities](#6-lib-utilities)
7. [Theme & styling](#7-theme--styling)
8. [Types](#8-types)
9. [Routing & navigation](#9-routing--navigation)
10. [Auth & server boundaries](#10-auth--server-boundaries)
11. [Testing](#11-testing)
12. [Imports & aliases](#12-imports--aliases)
13. [Anti-patterns](#13-anti-patterns)
14. [New feature checklist](#14-new-feature-checklist)

---

## 1. Directory layout

```
frontend/
├── e2e/                    # Playwright specs + helpers (not unit tests)
├── public/                 # Static assets only
└── src/
    ├── app/                # Routes (App Router)
    │   ├── (auth)/         # Unauthenticated routes
    │   └── (app)/          # Authenticated shell (session guard in layout)
    ├── components/
    │   ├── ui/             # shadcn primitives (kebab-case)
    │   ├── shared/         # Cross-hub reusable UI (kebab-case)
    │   ├── layout/         # Shell, sidebar, topbar, page transitions (PascalCase + kebab-case)
    │   │   └── animated-page.tsx, animated-page-inner.tsx
    │   ├── providers/      # Scoped provider wrappers used by components
    │   ├── auth/           # RoleGuard and auth UI gates
    │   └── {domain}/       # Hub-specific UI (PascalCase) — hr, pos, kitchen, crm, …
    ├── context/            # React context providers (*Context.tsx)
    ├── hooks/
    │   ├── domains/        # TanStack Query hooks grouped by domain
    │   └── use*.ts         # Generic / cross-cutting hooks
    ├── lib/                # Pure utilities, filters, API helpers, navigation
    │   ├── api/            # client.ts (browser), server.ts (RSC)
    │   ├── auth/           # server-only session helpers
    │   └── theme/          # Tailwind class-name helpers per domain
    ├── providers/          # App-root providers (Query, Ant Design)
    ├── styles/theme/       # CSS custom properties (tokens.css, utilities.css)
    └── types/              # Shared TypeScript types & Zod schemas
```

**Rules**

- Route files live only under `src/app/`. Do not put routable pages in `components/`.
- Domain UI lives in `components/{domain}/`, co-located with the hub it serves.
- Cross-hub primitives live in `components/shared/`, not duplicated per domain.
- Server-only code uses `import "server-only"` or lives under `lib/auth/server.ts` / `lib/api/server.ts`.

---

## 2. File naming

| Kind | Case | Pattern | Example |
|------|------|---------|---------|
| Route segment folder | kebab-case | `{segment}/page.tsx` | `stock-in/page.tsx` |
| Server page entry | fixed | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` | — |
| Client page body | kebab-case | `{name}-page-client.tsx` | `inventory-page-client.tsx` |
| Auth page content | kebab-case | `{route}-content.tsx` | `login-content.tsx` |
| Domain component | PascalCase | `{Name}.tsx` | `CreateShiftModal.tsx` |
| Shared / UI primitive | kebab-case | `{name}.tsx` | `hub-card.tsx`, `button.tsx` |
| Layout component | PascalCase | `{Name}.tsx` | `AppShell.tsx` |
| Hook | camelCase | `use{Name}.ts` | `useLineItemRows.ts` |
| Domain query hooks | camelCase | `use{Domain}Queries.ts` | `useHrQueries.ts` |
| Lib utility | kebab-case | `{name}.ts` | `ledger-filters.ts` |
| Theme module | kebab-case | `{domain}.ts` or `hub-{domain}.ts` | `hub-hr.ts`, `finance.ts` |
| Unit test | co-located | `{source}.test.ts` | `ledger-filters.test.ts` |
| E2E spec | kebab-case | `{name}.spec.ts` | `smoke.spec.ts` |
| Context | PascalCase | `{Name}Context.tsx` | `AuthContext.tsx` |

**Component suffixes (domain folder)**

| Suffix | Use when |
|--------|----------|
| `*Modal.tsx` | Dialog overlay with primary action (create/edit flows) |
| `*Form.tsx` | Inline or embedded form (not a modal) |
| `*Dialog.tsx` | Confirm / destructive / lightweight dialog |
| `*Sheet.tsx` | Slide-over detail panel |
| `*Panel.tsx` | Persistent section within a page |

Prefer `BranchFormModal` over `ModalBranchForm`. Keep suffix order consistent: `{Entity}{Purpose}{Container}`.

**Do not**

- Use kebab-case for hooks (`use-line-item-rows.ts` ❌).
- Mix `ModalForm` and `FormModal` in the same codebase.
- Place PascalCase files in `components/shared/` or `components/ui/`.

---

## 3. App Router & pages

### Server vs client

Default to **Server Components**. Add `"use client"` only when the file needs:

- `useState`, `useEffect`, or other React hooks
- Browser APIs or event handlers
- TanStack Query hooks (`useQuery`, `useMutation`)
- Third-party client-only libraries

### Page file patterns

**Pattern A — Server redirect (hub index)**

Use for hub roots that should land on a default tab:

```tsx
// app/(app)/finance/page.tsx
import { redirect } from "next/navigation";

export default function FinanceIndex() {
  redirect("/finance/overview");
}
```

Prefer server `redirect()` over client `useEffect` + `router.replace` unless the target depends on client-only state (e.g. badge counts).

**Pattern B — Inline client page**

Use for tab pages with moderate interactivity. One file is fine:

```tsx
"use client";
// app/(app)/hr/employees/page.tsx
export default function EmployeesPage() { … }
```

**Pattern C — Server shell + client body**

Use when the page is large, needs a thin server entry, or shares layout metadata:

```
app/(app)/inventory/
  page.tsx                  # Server Component (optional metadata)
  inventory-page-client.tsx # "use client" — all interactive UI
```

Rules for `*-page-client.tsx`:

1. **Co-locate** with the route that renders it (same folder as `page.tsx`, or a sibling subfolder that has **no** `page.tsx` — see below).
2. Never import a page client from a different route folder.
3. Default export name: `{Route}PageClient` (e.g. `DashboardPageClient`, `InventoryPageClient`).

**Co-location subfolder (no extra route)**

When the URL is the parent segment (e.g. `/` maps to `(app)/page.tsx`), group the client in a named subfolder **without** `page.tsx` so Next.js does not create a new route:

```
app/(app)/
  page.tsx                           # Server shell → /
  dashboard/
    dashboard-page-client.tsx        # No page.tsx here — not a /dashboard URL
```

Use the hub or feature name as the subfolder (`dashboard/`, not a generic `client/`).

### When to use which pattern

| Situation | Pattern | Example |
|-----------|---------|---------|
| Hub index → fixed default tab | **A** Server `redirect()` | `/finance` → `/finance/overview` |
| Hub index → tab depends on client badges | **B′** Client `router.replace` in thin `page.tsx` | `/hr`, `/procurement` |
| Hub index with substantial UI (grid, widgets, branch scope) | **C** `*-page-client.tsx` | `/`, `/inventory`, `/settings` |
| Tab page &lt; ~250 lines, single concern | **B** Inline `"use client"` in `page.tsx` | `/hr/employees` |
| Tab page ≥ ~250 lines or multiple panels/modals | **C** `*-page-client.tsx` | `/crm/customers`, `/crm/promotions` |
| Login / auth form | **D** `{route}-content.tsx` | `/login` |

**Split checklist (Pattern C)** — split when any of:

- `page.tsx` would exceed ~250 lines
- Page mixes list + filters + modals + detail sheets
- Page needs `useSearchParams` / layout persistence with a thin server entry for future metadata

**Do not split** when the page is a short redirect stub or a simple list with one modal (&lt; ~150 lines).

### Current route registry

| Path | Pattern | Client file |
|------|---------|-------------|
| `/` | C | `dashboard/dashboard-page-client.tsx` |
| `/inventory` | C | `inventory/inventory-page-client.tsx` |
| `/settings` | C | `settings/settings-page-client.tsx` |
| `/organization/branches` | C | `organization/branches/branches-page-client.tsx` |
| `/organization/users` | C | `organization/users/users-page-client.tsx` |
| `/crm/customers` | C | `crm/customers/customers-page-client.tsx` |
| `/crm/promotions` | C | `crm/promotions/promotions-page-client.tsx` |
| `/finance`, `/crm`, `/pos`, `/organization` | A | — (redirect only) |
| `/hr`, `/procurement` | B′ | — (badge-aware client redirect) |
| Most other hub tabs | B | inline in `page.tsx` |
| `/login` | D | `login-content.tsx` |

**Pattern D — Auth content split**

```
app/(auth)/login/
  page.tsx           # Server — metadata, layout
  login-content.tsx  # "use client" — form & interactions
```

### Route groups

| Group | Purpose |
|-------|---------|
| `(app)` | Authenticated ERP shell (`AppShell`, session check) |
| `(auth)` | Login and other public auth routes |

Parentheses segments are **not** part of the URL.

### Special files

| File | Responsibility |
|------|----------------|
| `layout.tsx` | Persistent UI, providers scoped to segment |
| `loading.tsx` | Suspense fallback for segment |
| `error.tsx` | Segment error boundary (`"use client"`) |
| `not-found.tsx` | 404 within segment |

### Async request APIs (Next.js 15+)

`params`, `searchParams`, `cookies()`, and `headers()` are async. Always `await` them in Server Components:

```tsx
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  …
}
```

---

## 4. Components

### Where to put a new component

```
Is it a shadcn primitive?          → components/ui/
Used across 2+ hubs?               → components/shared/
Shell / sidebar / topbar?          → components/layout/
Page enter animation?              → components/layout/animated-page.tsx
Scoped to one hub?                 → components/{domain}/
Auth guard / role gate?            → components/auth/
App-wide provider wrapper?         → providers/ (root) or components/providers/ (ThemeProvider, ThemeToggle, AntdScope)
```

### `components/shared/` vs `components/{domain}/`

| `shared/` | `{domain}/` |
|-----------|-------------|
| `hub-card`, `stat-card`, `data-table` | `CreateShiftModal`, `KitchenKanbanBoard` |
| `form-modal`, `list-toolbar` | Domain-specific charts and wizards |
| No business vocabulary in name | Names reflect hub entities |

Extract to `shared/` when **two or more hubs** use the same primitive. Do not pre-abstract for one consumer.

### Props & composition

- Prefer explicit props over boolean prop proliferation (`variant`, `size` enums over `isX`, `showY`, `hideZ`).
- Keep server-fetched data in Server Components; pass serializable props to client children.
- Modal forms: accept `open`, `onOpenChange`, `onSuccess` — parent owns visibility state.

### File size guideline

If a `page.tsx` exceeds ~300 lines or mixes list + filters + modals + detail panels, extract:

1. Page-specific sections → `components/{domain}/`
2. Reusable list chrome → `components/shared/`

---

## 5. Hooks & data fetching

### Location

| Hook type | Path |
|-----------|------|
| API queries / mutations for a domain | `hooks/domains/use{Domain}Queries.ts` |
| UI / browser / layout behavior | `hooks/use{Name}.ts` |

### TanStack Query conventions

- **Query keys:** `['entity', …scopes]` — e.g. `['shifts', role, branchId]`.
- **Mutations:** invalidate related query keys in `onSuccess`.
- **API calls:** use `fetchAPI` from `@/lib/api` (client) — not raw `fetch` scattered in components.
- **Endpoints:** define paths in `lib/endpoints.ts`; never hardcode URL strings in components.

```tsx
// hooks/domains/useHrQueries.ts
export const useShifts = (role?: string, branchId?: number) =>
  useQuery({
    queryKey: ["shifts", role, branchId],
    queryFn: () => fetchAPI(API_ENDPOINTS.hr.shiftsMe),
    enabled: !!role,
  });
```

### Naming inside domain files

- Queries: `use{Entity}` or `use{Entity}List` — `useShifts`, `useEmployees`.
- Mutations: `useCreate{Entity}`, `useUpdate{Entity}`, `useDelete{Entity}`.
- File name: `useHrQueries.ts` (plural domain + `Queries` suffix). Exception: small summary hooks may use `useProductsSummary.ts` when they are not the main domain file.

---

## 6. Lib utilities

### `lib/` root files

| Pattern | Purpose | Example |
|---------|---------|---------|
| `{entity}-filters.ts` | Pure filter/sort helpers for list pages | `ledger-filters.ts` |
| `{hub}-hub-url.ts` | URL builders for hub tab deep links | `hr-hub-url.ts` |
| `navigation.ts` | Sidebar, hubs, breadcrumbs, path labels |
| `endpoints.ts` | Backend API path constants |
| `form.ts`, `utils.ts` | Shared non-UI helpers |

Every `*-filters.ts` file **must** have a co-located `*-filters.test.ts`.

### API layer

| Module | Runtime | Use |
|--------|---------|-----|
| `lib/api/client.ts` | Browser / client components | `fetchAPI`, auth headers |
| `lib/api/server.ts` | Server Components, layouts | Cookie-based server fetch |
| `lib/api.ts` | Re-export barrel | Prefer `@/lib/api` in client code |

Backend API paths (`/hr/users`, `/branches`) are **not** frontend routes. Do not confuse them with `src/app/` URLs.

---

## 7. Theme & styling

Three layers — use the right one:

```
styles/theme/tokens.css     CSS custom properties (:root / .dark)
styles/theme/utilities.css  Low-level utility classes
lib/theme/*.ts              TypeScript helpers returning Tailwind class strings
```

### Rules

1. **No raw hex in components** for semantic colors. Use theme helpers or `var(--token)`.
2. **Import from domain modules** — not the `@/lib/theme` barrel. Hub-owned UI uses `@/lib/theme/hub-{domain}`; see module map below.
3. **Hub-owned UI** (e.g. `components/crm/`, `components/hr/`) must import hub tokens from `@/lib/theme/hub-{domain}` — not `hub-section-aliases` or the root barrel.
4. **Dark mode:** all semantic tokens must work in `.dark`. Test both modes when changing colors.
5. **Naming in `lib/theme/`:**
   - `hub-{domain}.ts` — hub-specific accents, tabs, banners
   - `{domain}.ts` — non-hub modules (`finance.ts`, `dashboard.ts`)
   - `settings-hub-chrome.ts` — settings **page chrome** (list panels, icons, sheets)
   - `settings-form-section.ts` — settings **form section** blocks (not hub chrome)

### Theme module map (import directly)

| Module | Use for |
|--------|---------|
| `hub-{crm,hr,kitchen,products,procurement}.ts` | Hub accents, dialogs, section panels (re-exported from aliases) |
| `finance.ts` | Ledger, accounts, settlement |
| `stock.ts` | Inventory, batches, forms, expiry heatmap |
| `assets.ts` | Equipment, maintenance |
| `organization.ts` | Branches, users |
| `settings-hub-chrome.ts` | Settings list panels, audit sheets |
| `settings-form-section.ts` | Settings form blocks |
| `dashboard.ts` | Dashboard widgets, charts, drag grid |
| `immersive.ts` | POS terminal, KDS, numpad, receipts |
| `auth.ts` | Login page |
| `shell.ts` | App shell, sidebar, topbar, breadcrumbs |
| `hub-primitives.ts` | CTAs, chips, links, empty states, spinners |
| `hub-banners.ts` | Info/warning banners |
| `hub-panel.ts` | Generic hub section panels, tabs |
| `hub-accent.ts` | Hub card icons |
| `data-table.ts` | Table chrome, pagination, scroll hints |
| `typography.ts` | Headings, labels, micro type |
| `surface.ts` | `text.*`, cards, elevated panels |
| `metric.ts` | Metric tones and values |
| `status.ts` | Status badges and tones |
| `color-helpers.ts` | Form validation, context banners |
| `feedback.ts` | Query error banners, access denied |
| `chart-styles.ts` | Chart palettes |
| `css-var.ts` / `defaults.ts` | Runtime token reads |
| `antd-bridge.ts` | Ant Design theme config |

`index.ts` and `hub-ui.ts` remain **internal barrels** for back-compat; do not add new imports from `@/lib/theme`.

### Tailwind

- Use `cn()` / `clsx` + `tailwind-merge` for conditional classes.
- Prefer theme helper functions over long inline class strings repeated across files.

---

## 8. Types

```
types/
  api.ts       — API response shapes, enums, payloads
  schemas.ts   — Zod DTOs for forms / validation
  auth.ts      — Session / role types
  index.ts     — Public barrel (re-export all consumer-facing types)
```

- Add new shared types to the appropriate file and **export from `types/index.ts`**.
- Component-local types may stay in the component file if not reused.
- Zod schemas live in `schemas.ts`; infer TS types with `z.infer<typeof schema>`.

---

## 9. Routing & navigation

### Single source of truth

All sidebar items, hub tabs, breadcrumbs, and path labels are defined in `lib/navigation.ts`.

When adding a route:

1. Create `app/(app)/{hub}/{tab}/page.tsx`.
2. Register the path in `HUBS` or `SIDEBAR_GROUPS` in `navigation.ts`.
3. Add `PATH_LABELS` entry for breadcrumbs.
4. Add a test case in `lib/navigation.test.ts` if the route has legacy or normalization behavior.

### Canonical paths

Use canonical paths everywhere (links, tests, docs):

| Canonical | Legacy (redirect only) |
|-----------|------------------------|
| `/organization/branches` | `/branches` |
| `/organization/users` | `/users` |
| `/inventory/batches` | `/inventory/stock` |
| `/inventory/transfers` | `/procurement/transfers` |
| `/assets` | `/assets/equipment` |

Legacy folders keep a **redirect-only** `page.tsx` for bookmarks. New code must not link to legacy paths.

### Hub index behavior

| Preferred | When |
|-----------|------|
| Server `redirect()` | Static default tab |
| Client redirect with badges | Default tab depends on `nav-counts` / query state |

---

## 10. Auth & server boundaries

- `(app)/layout.tsx` checks session server-side and redirects to `/login`.
- `AuthProvider` receives `initialUser` from the server layout — avoid flash of unauthenticated UI.
- `RoleGuard` and role checks: use `NavRole` / `Role` from `@/types/api`.
- Files that call `cookies()` or `getSession()` must not be imported from client components.
- Mark server-only modules with `import "server-only"` at the top.

---

## 11. Testing

### Unit tests (Vitest)

- Location: co-located `*.test.ts` next to source (`src/**/*.test.{ts,tsx}`).
- Test pure functions: filters, navigation normalization, theme token helpers, form utils.
- Run: `npm test` (from `frontend/`).

### E2E (Playwright)

- Location: `e2e/*.spec.ts`, helpers in `e2e/helpers/`.
- **Keep in repo:** specs, helpers, `playwright.config.ts`.
- **Never commit:** `e2e/reports/`, `e2e/.auth/`, `test-results/` (gitignored artifacts).
- Use **canonical routes** in specs (`/organization/branches`, not `/branches`).
- Smoke suite (`smoke.spec.ts`) is the minimal CI gate; theme audits are manual / optional.

---

## 12. Imports & aliases

- Always use `@/` alias for `src/` imports. No deep relative paths like `../../../`.
- Import order (enforced by convention):
  1. External packages
  2. `@/types`, `@/lib`, `@/hooks`
  3. `@/components`
  4. Relative imports (same feature only)
- Default exports: `page.tsx`, `*-page-client.tsx`, layout entries.
- Named exports: hooks, lib utilities, types.

```tsx
// Good
import { useShifts } from "@/hooks/domains/useHrQueries";
import { hubCardClassName } from "@/lib/theme/hub-hr";
import { CreateShiftModal } from "@/components/hr/CreateShiftModal";

// Avoid
import { useShifts } from "../../../hooks/domains/useHrQueries";
```

---

## 13. Anti-patterns

| Anti-pattern | Why | Instead |
|--------------|-----|---------|
| Page client in wrong route folder | Breaks co-location, confuses ownership | Move next to its `page.tsx` |
| `"use client"` on entire hub layout | Ships unnecessary JS | Client only at leaf pages / widgets |
| Hardcoded API URLs in components | Drift from backend | `lib/endpoints.ts` |
| Inline `var(--…)` colors in every file | Dark mode regressions | `lib/theme` helpers |
| New hub tab without `navigation.ts` | Broken sidebar / breadcrumbs | Register in `HUBS` |
| `__tests__/` folders | Inconsistent with project | Co-located `*.test.ts` |
| Empty placeholder directories | Noise | Delete or add real files |
| Linking to legacy routes | Perpetuates migration debt | Canonical paths only |
| God `page.tsx` (500+ lines) | Untestable, hard to review | Extract `components/{domain}/` |

---

## 14. New feature checklist

When shipping a new hub tab or major screen:

- [ ] Route at `src/app/(app)/{hub}/{tab}/page.tsx`
- [ ] Path registered in `lib/navigation.ts` (`HUBS`, `PATH_LABELS`)
- [ ] Domain components in `components/{domain}/` (PascalCase)
- [ ] Query hooks in `hooks/domains/` if fetching API data
- [ ] Filters (if any) in `lib/{entity}-filters.ts` + test
- [ ] Theme tokens via `lib/theme/` — light and dark verified
- [ ] Role restrictions match `NavRole` in navigation config
- [ ] No legacy URL used in new links
- [ ] Unit tests for pure logic; smoke or audit e2e if UI-critical

---

## Related files

| File | Role |
|------|------|
| `src/lib/navigation.ts` | Route registry, hubs, breadcrumbs |
| `src/lib/endpoints.ts` | API path constants |
| `src/lib/theme/index.ts` | Theme helper barrel |
| `src/styles/theme/tokens.css` | Design tokens |
| `vitest.config.ts` | Unit test glob |
| `playwright.config.ts` | E2E projects |

---

*Last updated: June 2026 — revise this document when introducing new cross-cutting patterns (e.g. Server Actions, new provider layout).*
