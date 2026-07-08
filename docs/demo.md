# BranchBrew ERP — Demo Guide

Portfolio demo script for reviewers and interview walkthroughs. New here? Start at the [project README](../README.md).

**Fastest path: the [live demo](https://branchbrew-cafe-erp.vercel.app)** — click a demo account on the login page and follow the walkthrough below. The API sleeps on its free tier, so the first request may take ~30s. To run it locally instead, use the quick start below.

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
| **POS cashier** | `staff.downtown@branchbrew.dev` — Downtown Cashier |
| **Riverside Manager** | `manager.riverside@branchbrew.dev` |
| **Riverside Barista** | `staff.riverside@branchbrew.dev` |
| **CRM member phone** | `0811111111` — Demo Member, 120 pts, SILVER |
| **Promo codes** | `WELCOME10` (10% off, min 100) · `SAVE20` (20 baht off, min 150) |
| **PO to receive (live)** | `PO-DEMO-001` — APPROVED @ Downtown |
| **PO to pay (live)** | `PO-DEMO-005` — RECEIVED · UNPAID, ~40 days old (AP aging 31–60 bucket) |
| **Hero ledger chain** | `PO-DEMO-003` (received beans) → `ORD-*` sale (2× Iced Latte) → `PAY-PO-DEMO-003` (supplier paid) |
| **Stock count to finish (live)** | Draft "Weekly spot check" @ Downtown — Inventory → Stocktake |
| **Notifications** | Bell in the top bar — unread PO approval + expiring batches @ Downtown |
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

1. **Dashboard** (`/`) — Today's sales vs yesterday, gross margin & food-cost %, revenue chart (flip **7D/30D**, note the order-count overlay), top-5 sellers with revenue, inventory alerts. Widgets are draggable — the layout persists.
2. **POS** (`/pos/terminal`) — Pick **Iced Latte**, add modifiers. Optional: lookup member `0811111111`, apply `WELCOME10`. At checkout enter cash received (quick buttons ฿100/฿500 or **Exact**) — **Pay stays disabled until the cash covers the total**, then shows change due.
3. **KDS** (`/kds`) — Show pending/preparing tickets and the **All-day** per-item tally strip; complete one ticket.
4. **Orders** (`/pos/orders`) — Refunded and promo orders from seed.

**Story to tell:** Order → recipe stock deduction → accounting journal (event-driven) → real-time KDS.

---

### Flow B — Supply (≈5 min)

**Login:** `manager@branchbrew.dev` or `admin@branchbrew.dev`

1. **Procurement** (`/procurement/orders`) — Find **PO-DEMO-001** (APPROVED). Receive goods. Note the **PAID / UNPAID** badges on received POs.
2. **Inventory** (`/inventory`) — Stock levels; note low cups @ Riverside.
3. **Batches** (`/inventory/batches`) — Expiring in 3 days; expired oat milk @ Downtown.
4. **Stocktake** (`/inventory/stocktake`) — Open the approved **month-end blind count** (variances valued in baht, posted to the ledger as `STOCKCOUNT-*`), then finish the draft **"Weekly spot check"**: enter a counted quantity, submit, and approve.
5. **Transfers** (`/inventory/transfers`) — Pending and shipped transfers.

**Story to tell:** PO → receive → batch/expiry → physical count → variance posts shrinkage to the GL → inter-branch transfer.

---

### Flow C — Operate (≈5 min)

**Login:** `manager@branchbrew.dev`

1. **Notifications** — Click the **bell** in the top bar: unread PO-approval and expiring-batch alerts; click one to jump to the page (it marks itself read).
2. **HR / Attendance** (`/hr/attendance`) — Manager currently clocked in.
3. **Payroll** (`/hr/payroll`) — Approved run (last month) + draft @ Riverside. Approving a run posts gross pay, withholdings, and net cash to the ledger (`PAYROLL-*`).
4. **Finance overview** (`/finance/overview`) — **Accounts payable card**: ฿400 outstanding in the 31–60 day bucket (that's `PO-DEMO-005`) — pay it from Procurement and watch the card empty. **Output VAT (ภ.พ.30) card**: monthly sales ex-VAT vs output VAT. Below: pending shift settlement @ Downtown.
5. **Ledger** (`/finance/ledger`) — Search **`PO-DEMO-003`** (espresso bean receive), the matching **`ORD-`** hero sale (revenue split into ex-VAT sales + output VAT), and **`PAY-PO-DEMO-003`** (the payment that settled AP).

**Story to tell:** Attendance → payroll → settlement → general ledger. Hero chain is now purchase-to-pay complete: PO receive posts inventory/AP → POS sale posts revenue + output VAT + COGS → supplier payment settles AP — and the AP account balance reconciles to the unpaid-PO list on the aging card.

---

### Flow D — Produce (≈3 min)

**Login:** `admin@branchbrew.dev`, pick **BranchBrew Central Kitchen** in the branch picker

1. **Central Kitchen** (`/kitchen`) — Kanban board: planned / in-progress / completed cold-brew production orders.
2. **Production BOM** (`/kitchen/boms`) — Cold brew base recipe (espresso beans per ml).
3. Completing a production order consumes raw batches FIFO, creates a finished-goods batch, and posts any standard-cost variance to account 5030.

**Story to tell:** Central kitchen produces intermediates → finished batches transfer out to branches.

---

## Super Admin extras

**Login:** `admin@branchbrew.dev`

- Branch picker: **All branches** vs single branch on inventory.
- Approve settlements, organization users/branches.

---

## What the demo includes

- **Dashboard** — Today/yesterday sales, gross margin, 7/30-day revenue trend, top-5 sellers with revenue, inventory alerts.
- **KDS queue** — Active tickets with varied wait times and a populated all-day item tally (not an empty board).
- **Stocktake** — One approved blind count with valued variances (and its `STOCKCOUNT-*` ledger entry), one draft count ready to finish live, plus a damage adjustment (`ADJ-*`).
- **Accounts payable** — One paid PO (`PAY-PO-DEMO-003`) and one 40-day-old unpaid PO so the AP aging card has real buckets; the 2010 balance reconciles to the unpaid list.
- **Notifications** — Three unread alerts (low stock, PO approval, expiring batches) and two already handled — the bell badge is live.
- **Edge states** — REJECTED settlement, REFUNDED order, inactive promo `SUMMER24`.
- **Audit log** — Settings → Audit (`/settings/audit`) — now including stock-count approvals and supplier payments.

To reset demo data, re-run `npm run db:seed` (see warning at top).

---

## Interview talking points

1. **Order pipeline** — POS create → inventory from recipe → outbox → accounting → WebSocket to KDS.
2. **Multi-branch RBAC** — `SUPER_ADMIN` vs branch-scoped Manager/Staff.
3. **Transactional outbox** — Reliable side effects after DB commit.
4. **Stocktake closes the loop** — physical counts snapshot expected stock at submit, approved variances adjust batches FIFO and post shrinkage to a dedicated GL account.
5. **The ledger reconciles** — AP balance = unpaid POs on the aging card; sales split into ex-VAT revenue + output VAT liability; payroll posts gross/withholdings/net — so the operational P&L and the accounting P&L agree.

Keep supporting modules (assets, equipment registry) as breadth; go deep on the flows above.
