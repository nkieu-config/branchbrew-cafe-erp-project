# KDS Page Overrides

> **PROJECT:** QafaCafe ERP  
> **Route:** `/kds`  
> **Overrides:** `design-system/qafacafe-erp/MASTER.md`

---

## Layout

- **Standalone page** (no `HubShell`) — uses `HubPageHeader` with `titleLevel="h1"`.
- **Immersive:** full viewport height; sidebar hidden on mobile; minimal chrome.
- **Grid:** order cards in responsive columns; readable from 1–2 meters (kitchen distance).

## Real-time UX

- **Live sync badge:** green pulse when socket connected; rose + polling hint when disconnected.
- **Status actions:** Start → Ready → Bump with loading state per order (`updatingOrderId`).
- **Queue numbers:** prominent `formatQueueNumber()` — primary scan target for staff.

## Visual

- **Dark mode:** preferred in kitchen; ensure contrast on status pills (emerald / amber / rose).
- **Typography:** bold queue #, clear item list; modifier notes must not truncate silently.
- **Animation:** only functional (pulse on live badge, button loading). No page enter animation required.

## Accessibility

- Icon buttons need `aria-label` (e.g. bump order).
- Status changes should be visible without color alone (icon + text).

## Do not

- Add hub tabs to KDS — it is a single-purpose surface.
- Use antd on this page unless adding a large admin table (not expected).
