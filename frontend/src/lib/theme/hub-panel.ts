import type { HubId } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { hubCardIconClass } from "./hub-accent";
import { formDialogContentClassName } from "./typography";

const HUB_TONE_VARS: Record<
  HubId,
  { subtle: string; border: string; fg: string }
> = {
  inventory: {
    subtle: "--tone-inventory-subtle",
    border: "--tone-inventory-border",
    fg: "--tone-inventory-fg",
  },
  procurement: {
    subtle: "--tone-procurement-subtle",
    border: "--tone-procurement-border",
    fg: "--tone-procurement-fg",
  },
  hr: { subtle: "--tone-hr-subtle", border: "--tone-hr-border", fg: "--tone-hr-fg" },
  products: {
    subtle: "--tone-products-subtle",
    border: "--tone-products-border",
    fg: "--tone-products-fg",
  },
  kitchen: {
    subtle: "--tone-kitchen-subtle",
    border: "--tone-kitchen-border",
    fg: "--tone-kitchen-fg",
  },
  crm: { subtle: "--tone-crm-subtle", border: "--tone-crm-border", fg: "--tone-crm-fg" },
  finance: {
    subtle: "--tone-finance-subtle",
    border: "--tone-finance-border",
    fg: "--tone-finance-fg",
  },
  assets: {
    subtle: "--tone-assets-subtle",
    border: "--tone-assets-border",
    fg: "--tone-assets-fg",
  },
  pos: { subtle: "--tone-pos-subtle", border: "--tone-pos-border", fg: "--tone-pos-fg" },
  settings: {
    subtle: "--tone-settings-subtle",
    border: "--tone-settings-border",
    fg: "--tone-settings-fg",
  },
  organization: {
    subtle: "--tone-organization-subtle",
    border: "--tone-organization-border",
    fg: "--tone-organization-fg",
  },
};

/** Standard elevated panel for hub list tabs (Tier A/C list regions). */
export function hubSectionPanelClassName(hubId?: HubId, className?: string) {
  return cn(
    "rounded-xl shadow-sm border p-4 sm:p-6 space-y-4",
    "bg-[var(--table-container-bg)] border-[var(--table-container-border)]",
    className,
  );
}

/** Hub-branded dialog shell — prefer over per-hub *DialogContentClassName helpers. */
export function hubDialogContentClassName(
  width: number | string = 800,
  className?: string,
) {
  return formDialogContentClassName(width, className);
}

/** Hub tone chip for metadata (category, role, tier). */
export function hubMetaBadgeClassName(hubId: HubId, className?: string) {
  const tone = HUB_TONE_VARS[hubId];
  return cn(
    "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium uppercase tracking-wide",
    `bg-[var(${tone.subtle})] text-[var(${tone.fg})] border-[var(${tone.border})]`,
    className,
  );
}

/** Hub accent icon for headings and empty states. */
export function hubIconClassName(hubId: HubId, className?: string) {
  return cn(hubCardIconClass(hubId), className);
}
