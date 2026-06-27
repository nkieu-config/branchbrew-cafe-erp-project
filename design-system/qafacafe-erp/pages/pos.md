# POS Page Overrides

> **PROJECT:** QafaCafe ERP  
> **Routes:** `/pos`, `/pos/terminal`, `/pos/orders`, `/pos/settlement`  
> **Overrides:** `design-system/qafacafe-erp/MASTER.md`

---

## Layout

- **Hub shell:** `HubShell` with `hubId="pos"`, `wrapAntd: false` — prefer shadcn in POS zone.
- **Terminal & settlement:** immersive layout — `AppShell` removes extra padding; optimize for tablet at counter (landscape-friendly).
- **Max content width:** terminal uses full width; hub pages use `HubShell` default (`max-w-[1600px]`).

## Interaction

- **Touch targets:** minimum 44×44px on menu tiles, quantity controls, and checkout actions.
- **Feedback:** disable buttons + spinner during checkout; toast on success/error (`sonner`).
- **No hover-only actions:** every action must work on tap.

## Visual

- **Primary actions:** emerald (`bg-emerald-600`) for pay/checkout; destructive red for void/refund confirm.
- **Status:** use `StatusBadge` / order status colors consistently (pending → preparing → ready).
- **Avoid:** decorative animation on terminal; keep transitions ≤200ms; respect `prefers-reduced-motion`.

## Components

| Feature | Component / pattern |
|---------|---------------------|
| Menu grid | Large tappable cards, image optional |
| Modifier modal | shadcn `Dialog` |
| Orders / void | antd table inside hub where data-heavy |
| Receipt | readable monospace queue # via `formatQueueNumber` |

## Do not

- Mix antd Button in the same toolbar as shadcn Button on terminal.
- Block checkout on missing branch — show `BranchEmptyState` instead.
