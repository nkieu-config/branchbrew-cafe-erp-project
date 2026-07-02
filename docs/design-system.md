# BranchBrew Design System

BranchBrew uses **Tailwind CSS v4** with a CSS-first token architecture. This document is the contributor reference for colors, forms, component choice, and spacing.

## Token layers

```
primitives.ts          →  globals.css (:root / .dark)  →  tokens.css (derived)
       ↓                         ↓                              ↓
defaults.ts (SSR)          @theme inline                 lib/theme/*.ts (class helpers)
```

| Layer | Location | Purpose |
|-------|----------|---------|
| **Primitives** | `frontend/src/lib/theme/primitives.ts` | Canonical OKLCH values shared with CSS |
| **Semantic CSS** | `frontend/src/app/globals.css` | `--background`, `--accent`, `--success`, chart palette |
| **Derived tokens** | `frontend/src/styles/theme/tokens.css` | Hub tones, tables, POS/KDS via `color-mix(in oklch, …)` |
| **Utility CSS** | `frontend/src/styles/theme/utilities/` | Forms, tables, surfaces, receipt helpers |
| **Tailwind bridge** | `@theme inline` in `globals.css` | `--color-*`, `--spacing-*` → `bg-primary`, `gap-field` |
| **App helpers** | `frontend/src/lib/theme/` | `hubCtaClassName`, `formFieldInsetClassName`, etc. |

**Rule:** Do not hardcode hex/rgb in `app/` or `components/`. Use semantic helpers or Tailwind tokens.

### Spacing tokens

| Token | CSS variable | Typical use |
|-------|--------------|-------------|
| `gap-field` | `--spacing-field` (0.5rem) | Label → control → error inside `FormField` |
| `gap-stack` | `--spacing-stack` (1rem) | Between fields in a form |
| `space-y-section` | `--spacing-section` (1.5rem) | Page chrome blocks |
| `space-y-page` | `--spacing-page` (2rem) | Large page vertical rhythm |

## Forms — official `FormField` pattern

Use compound components from `@/components/ui/form-field`:

```tsx
<FormField id="shift-date" error={fieldErrors.date}>
  <FormFieldLabel className={text.secondary}>Date</FormFieldLabel>
  <FormFieldControl>
    <Input
      type="date"
      className={cn(formLineDateFieldClassName(), formFieldInvalidClassName(!!fieldErrors.date))}
    />
  </FormFieldControl>
  <FormFieldError />
</FormField>
```

### Select inside FormField

`FormFieldControl` clones props onto the direct child; Radix/Base UI `Select` does not forward `aria-invalid` to the trigger. Use **`FormFieldSelectTrigger`** inside `<Select>`:

```tsx
<FormField id="leave-type" error={fieldErrors.type}>
  <FormFieldLabel>Type</FormFieldLabel>
  <Select value={leaveType} onValueChange={setLeaveType}>
    <FormFieldSelectTrigger className={formFieldInsetClassName("w-full")}>
      <SelectValue placeholder="Select type" />
    </FormFieldSelectTrigger>
    <SelectContent>...</SelectContent>
  </Select>
  <FormFieldError />
</FormField>
```

### Textarea

Use `FormFieldTextarea` (reads `useFormField()` context).

### Validation

1. Extract pure validators to `lib/<domain>/*-validation.ts`
2. Unit test validators (no DOM)
3. Map errors to `fieldErrors` state; clear per-field on change
4. Reference implementations: `CreateShiftModal`, `RequestLeaveModal`, `RegisterCustomerDialog`

## Toast vs inline error

| Situation | Use |
|-----------|-----|
| Missing/invalid field on submit | **Inline** `FormFieldError` + `aria-invalid` |
| Cross-field rules (e.g. end ≤ start) | **Inline** on the affected field |
| API / network failure | **Toast** (`sonner`) |
| Success confirmation | **Toast** |
| Permission / branch scope | **Banner** or empty state, not toast |

## antd vs shadcn

| Use **antd** | Use **shadcn / FormField** |
|--------------|----------------------------|
| Data-dense tables, pagination, calendar heatmaps | App shell, dialogs, hub forms |
| Complex table features (fixed columns, expand rows) | POS/KDS immersive UI |
| Components bridged in `styles/theme/utilities/tables.css` | New modals and settings forms |

**Theme sync:** antd reads tokens via `getAntdThemeConfig()` in `lib/theme/antd-bridge.ts` and CSS-variable overrides in `.data-table-shell` — do not hardcode antd colors in TS.

## Adding a hub color

1. Pick a chart/metric base in `globals.css` or reuse `--chart-*`
2. In `tokens.css`, add `--hub-<name>` and derived `--tone-<name>-*` using `color-mix`
3. Expose Tailwind token in `@theme inline`: `--color-hub-<name>: var(--hub-<name>)`
4. Add helper in `lib/theme/hub-*.ts` (e.g. `hubCtaClassName("crm")`)
5. Register icon token `--hub-<name>-icon` for navigation cards

Example hubs: `--hub-crm`, `--hub-hr`, `--hub-pos` (see `tokens.css`).

## Dark mode

- Variant: `@custom-variant dark (&:where(.dark, .dark *));` — portaled popovers inside `.dark` inherit dark styles
- Toggle: `ThemeToggle` switches light ↔ dark; updates `theme-color` meta
- antd tables: CSS-variable bridge updates on `html.dark` without remount

## Dialog / sheet motion

Overlays use **native `@starting-style`** via Base UI `data-starting-style` / `data-ending-style` (not `tw-animate-css`). Respect `motion-reduce:` — animations disable for prefers-reduced-motion.

## Automated checks

| Check | Location |
|-------|----------|
| Form validators | `lib/crm/register-customer-validation.test.ts`, `lib/hr/*-validation.test.ts` |
| Navigation / nav counts | `lib/navigation/navigation.test.ts`, `lib/nav-counts.test.ts` |
| a11y smoke | `e2e/a11y.spec.ts` (axe-core, critical/serious) |
| CI quality gates | `npm run type-check`, `npm run lint`, `npm run test` |
