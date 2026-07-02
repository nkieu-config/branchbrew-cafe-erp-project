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
  void hubId;
  return cn(
    "hub-section-panel rounded-xl shadow-sm border p-4 sm:p-6 space-y-4",
    "bg-[var(--hub-section-bg)] border-[var(--hub-section-border)]",
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

function hubListDialogContentClassName(className?: string) {
  return cn(
    "sm:max-w-lg rounded-xl max-h-[90vh] overflow-y-auto",
    "bg-[var(--table-container-bg)] border-[var(--table-container-border)] text-foreground",
    className,
  );
}

export function crmSectionPanelClassName(className?: string) {
  return hubSectionPanelClassName("crm", className);
}

export function productsSectionPanelClassName(className?: string) {
  return hubSectionPanelClassName("products", className);
}

export function productsCategoryBadgeClassName(className?: string) {
  return hubMetaBadgeClassName("products", className);
}

export function productsDialogContentClassName(className?: string) {
  return hubListDialogContentClassName(className);
}

export function procurementSectionPanelClassName(className?: string) {
  return hubSectionPanelClassName("procurement", className);
}

export function procurementMetaBadgeClassName(className?: string) {
  return hubMetaBadgeClassName("procurement", className);
}

export function procurementDialogContentClassName(className?: string) {
  return hubListDialogContentClassName(className);
}

export function kitchenSectionPanelClassName(className?: string) {
  return hubSectionPanelClassName("kitchen", className);
}

export function kitchenMetaBadgeClassName(className?: string) {
  return hubMetaBadgeClassName("kitchen", className);
}

export function kitchenDialogContentClassName(className?: string) {
  return hubListDialogContentClassName(className);
}

export function hrSectionPanelClassName(className?: string) {
  return hubSectionPanelClassName("hr", className);
}

export function posSectionPanelClassName(className?: string) {
  return hubSectionPanelClassName("pos", className);
}

export function hrMetaBadgeClassName(className?: string) {
  return hubMetaBadgeClassName("hr", className);
}

export function hrDialogContentClassName(className?: string) {
  return hubListDialogContentClassName(className);
}
