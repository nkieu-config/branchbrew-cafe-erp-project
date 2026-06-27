# Inventory Page Overrides

> **PROJECT:** QafaCafe ERP  
> **Routes:** `/inventory`, `/inventory/batches`, `/inventory/stock-in`, `/inventory/transfers`, `/inventory/waste`  
> **Overrides:** `design-system/qafacafe-erp/MASTER.md`

---

## Layout

- **Hub shell:** `HubShell` + `AntdScope` (`wrapAntd: true`).
- **Tabs (from `navigation.ts`):** Overview → Batches & Expiry → Receive Stock (GRN) → Stock Transfers → Waste Logs.
- **Breadcrumb example:** `QafaCafe / Inventory / Batches & Expiry` (hub linkable, tab current or linkable when nested).

## Data density

- **Tables:** antd `DataTable` for stock, batches, transfer lines, waste history.
- **Filters:** branch-scoped via Topbar branch picker (SUPER_ADMIN); staff see active branch only.
- **Empty states:** use `HubCard` description + action button; link related flows (e.g. GRN from low stock).

## Visual

- **Hub accent:** emerald (`text-emerald-500` icon in hub header).
- **Expiry / batch status:** color + badge text (not color alone) — green ok, amber expiring, red expired.
- **Forms:** GRN receive and waste log — multi-field → antd Form in modal or dedicated panel.

## Operations

- **Transfers:** `StockTransfersPanel` — status flow DRAFT → PENDING → SHIPPED → RECEIVED; confirm destructive actions.
- **Waste:** record form + history table on same tab.

## Do not

- Put procurement transfers under `/procurement/transfers` in new UI (legacy redirect → `/inventory/transfers`).
- Use `/inventory/stock` in new links (redirect → `/inventory/batches`).
