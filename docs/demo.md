# BranchBrew ERP — Demo Guide

Portfolio demo script for reviewers and interview walkthroughs.

> **Warning:** `npm run db:seed` wipes the target database before inserting demo data. Use only on a local database or an intentional demo/staging instance.

## Quick start

```bash
npm run migrate
npm run db:seed
npm run dev:backend   # terminal 1 — port 3000
npm run dev:frontend  # terminal 2 — port 3001
```

Open **http://localhost:3001/login**

### Remote / staging database

If `DATABASE_URL` points to a remote host (e.g. Supabase), the seed guard blocks by default:

```bash
ALLOW_DEMO_SEED=true DEMO_SEED_CONFIRM=WIPE_DEMO_DATABASE npm run db:seed
```

---

## 60-second path

For reviewers with very little time:

1. Login as **Manager** (`manager@branchbrew.dev` / `password123`)
2. **Dashboard** (`/`) — confirm today's sales widgets are populated
3. **POS** (`/pos/terminal`) — add an **Iced Latte**
4. **Finance → Ledger** (`/finance/ledger`) — search **`PO-DEMO-003`**, then an entry whose reference starts with **`ORD-`**

---

## Cheat sheet

| Item | Value |
|------|--------|
| **Password (all accounts)** | `password123` |
| **Primary demo login** | `manager@branchbrew.dev` — Downtown Manager |
| **Super Admin** | `admin@branchbrew.dev` — all branches |
| **POS cashier** | `staff.downtown@branchbrew.dev` — Downtown Staff |
| **Riverside Manager** | `manager.riverside@branchbrew.dev` |
| **Riverside Barista** | `staff.riverside@branchbrew.dev` |
| **CRM member phone** | `0811111111` — Demo Member, 120 pts, SILVER |
| **Promo codes** | `WELCOME10` (10% off, min 100) · `SAVE20` (20 baht off, min 150) |
| **PO to receive (live)** | `PO-DEMO-001` — APPROVED @ Downtown |
| **Hero ledger chain** | `PO-DEMO-003` (received beans) → `ORD-*` sale (2× Iced Latte) |
| **Currency** | THB (฿) — Settings → Default currency |
| **KDS** | Open tickets at Downtown (5+) and Riverside (1) after seed |

Use the **Demo accounts** buttons on the login page for Manager, Admin, Staff, and Riverside Manager.

---

## Branches

| Branch | Role in demo |
|--------|----------------|
| **Downtown Branch** | Primary — POS, KDS, finance, HR |
| **Riverside Branch** | Second site — low stock alerts, Riverside KDS |
| **BranchBrew Central Kitchen** | Production / BOM / kitchen kanban (select in branch picker) |

---

## 15-minute demo script

### Flow A — Sell (≈5 min)

**Login:** `manager@branchbrew.dev`

1. **Dashboard** (`/`) — Today's sales vs yesterday, revenue chart, top products, inventory alerts.
2. **POS** (`/pos/terminal`) — Pick **Iced Latte**, add modifiers. Optional: lookup member `0811111111`, apply `WELCOME10`.
3. **KDS** (`/kds`) — Show pending/preparing tickets; complete one ticket.
4. **Orders** (`/pos/orders`) — Refunded and promo orders from seed.

**Story to tell:** Order → recipe stock deduction → accounting journal (event-driven) → real-time KDS.

---

### Flow B — Supply (≈5 min)

**Login:** `manager@branchbrew.dev` or `admin@branchbrew.dev`

1. **Procurement** (`/procurement/orders`) — Find **PO-DEMO-001** (APPROVED). Receive goods.
2. **Inventory** (`/inventory`) — Stock levels; note low cups @ Riverside.
3. **Batches** (`/inventory/batches`) — Expiring in 3 days; expired oat milk @ Downtown.
4. **Transfers** (`/inventory/transfers`) — Pending and shipped transfers.

**Story to tell:** PO → receive → batch/expiry → inter-branch transfer.

---

### Flow C — Operate (≈5 min)

**Login:** `manager@branchbrew.dev`

1. **HR / Attendance** (`/hr/attendance`) — Manager currently clocked in.
2. **Payroll** (`/hr/payroll`) — Approved run (last month) + draft @ Riverside.
3. **Finance overview** (`/finance/overview`) — Pending shift settlement @ Downtown.
4. **Ledger** (`/finance/ledger`) — Search **`PO-DEMO-003`** (espresso bean receive), then an entry whose reference starts with **`ORD-`** (hero POS sale: 2× Iced Latte by Downtown cashier). These use the same reference format as production accounting events.

**Story to tell:** Attendance → payroll → shift settlement → general ledger. Hero chain: PO receive posts inventory/AP → POS sale posts revenue/COGS with matching `ORD-{orderId}` reference.

---

## Super Admin extras

**Login:** `admin@branchbrew.dev`

- Branch picker: **All branches** vs single branch on inventory.
- Approve settlements, organization users/branches.

---

## What the demo includes

- **Dashboard** — Today/yesterday sales, 7-day trend, top products, inventory alerts.
- **KDS queue** — Active tickets with varied wait times (not an empty board).
- **Edge states** — REJECTED settlement, REFUNDED order, inactive promo `SUMMER24`.
- **Audit log** — Settings → Audit (`/settings/audit`).

To reset demo data, re-run `npm run db:seed` (see warning at top).

---

## Interview talking points

1. **Order pipeline** — POS create → inventory from recipe → outbox → accounting → WebSocket to KDS.
2. **Multi-branch RBAC** — `SUPER_ADMIN` vs branch-scoped Manager/Staff.
3. **Transactional outbox** — Reliable side effects after DB commit.

Keep supporting modules (assets, equipment registry) as breadth; go deep on the three flows above.
