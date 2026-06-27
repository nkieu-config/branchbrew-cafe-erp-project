# QafaCafe ERP Design System

Design tokens and UX rules for the ERP frontend. Use this when building or reviewing UI.

## Structure

| Path | Purpose |
|------|---------|
| [`qafacafe-erp/MASTER.md`](./qafacafe-erp/MASTER.md) | Global source of truth — colors, typography, components, checklist |
| [`qafacafe-erp/pages/`](./qafacafe-erp/pages/) | Page-specific overrides (take precedence over MASTER) |

## How to use

When implementing or reviewing a page:

1. Check `design-system/qafacafe-erp/pages/[page-name].md` first (e.g. `pos.md`, `kds.md`, `inventory.md`).
2. If no page file exists, follow `MASTER.md`.
3. Cross-reference live tokens in `frontend/src/app/globals.css` and navigation in `frontend/src/lib/navigation.ts`.

## Regenerate (optional)

```bash
python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py \
  "ERP admin dashboard cafe chain" \
  --design-system --persist -p "QafaCafe ERP"
```

Add a page override:

```bash
python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py \
  "cafe ERP pos terminal" \
  --design-system --persist -p "QafaCafe ERP" --page "pos"
```

After regenerating, re-apply the **Implementation in this repo** section in `MASTER.md` and page-specific route notes if the script overwrites them.

## QA gate

Frontend PRs that touch UI should complete the checklist in [`.github/pull_request_template.md`](../.github/pull_request_template.md).
