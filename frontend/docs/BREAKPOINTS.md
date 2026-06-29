# Responsive breakpoints

BranchBrew uses Tailwind’s default breakpoints. **Pick the tier that matches the UI layer** — do not use one breakpoint for everything.

| Token | Min width | Primary use |
|-------|-----------|-------------|
| `sm` | 640px | Stack → row for **page headers**, form field pairs, inline labels |
| `md` | 768px | **Table density** — mobile card lists vs desktop tables |
| `lg` | 1024px | **App shell** — sidebar vs sheet nav, bottom nav, hub tabs in page chrome |
| `xl` | 1280px | Wide grids (KDS ticket columns, dashboard density) |

## `lg` — app shell

Use `lg:` for layout chrome shared across the app:

- Desktop sidebar vs mobile sheet (`AppShell`, `Sidebar`, `topbarMenuButtonClassName`)
- Global bottom navigation (`mobileBottomNavClassName`, `lg:hidden`)
- Hub tabs in `PageChrome` vs sidebar sub-tree (`HubShell` → `lg:hidden` on `HubTabsNav`)
- Desktop breadcrumb in topbar (`topbarDesktopBreadcrumbClassName`)
- POS cart sidebar vs mobile sticky bar + sheet (`hidden lg:flex` / `lg:hidden`)

**Rule:** If it changes how the user navigates the app, it probably belongs at `lg`.

## `md` — table density

Use `md:` when switching **data presentation**, not navigation:

- Mobile card list (`md:hidden`) + desktop table (`hidden md:block`)
- Reference: `AuditLogTable`, `SettlementsTable`, `ExpensesTable`
- Ant Design `responsive: ['md']` / `['lg']` on individual columns

**Rule:** If it only changes how rows are read, use `md` (or column-level `responsive`), not `lg`.

## `sm` — local layout

Use `sm:` for **within-page** stacking:

- `PageChrome` / `HubPageHeaderClient`: `flex-col sm:flex-row`
- `ListToolbar`: `flex-col sm:flex-row`
- List filters: `w-full sm:w-[180px]`
- Immersive headers: hide secondary copy below `sm` when space is tight

## Touch targets

Interactive controls should be **at least 44×44px** on touch routes:

- Sidebar nav, bottom nav, list filters — already `min-h-[44px]`
- Topbar actions — `topbarIconButtonClassName` (`h-11 w-11`)
- POS cart controls — `posCartTouchButtonClassName`

## Immersive routes (POS / KDS)

On mobile, operational immersive routes hide the **global topbar** (`hidden lg:block` wrapper in `AppShell`) and rely on route-specific header + bottom nav.

POS terminal uses a **sticky cart bar** above the POS tab bar; full cart opens in a bottom sheet.

## Adding new UI

1. Shell / nav change? → `lg`
2. Table or dense data? → `md` cards vs table
3. Header / form row? → `sm`
4. Operational touch control? → `min-h-[44px]` minimum
