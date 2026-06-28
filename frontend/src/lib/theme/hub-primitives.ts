import type { HubId } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { MetricTone } from "./metric";
import { metricValueClassName } from "./metric";
import type { StatusTone } from "./status";
import { statusToneClassName } from "./status";
import { hubCardIconClass } from "./hub-accent";

export function hubCtaClassName(hubId: HubId, className?: string) {
  const hubVar: Record<HubId, { bg: string; fg: string }> = {
    inventory: { bg: "--hub-inventory", fg: "--hub-inventory-fg" },
    procurement: { bg: "--hub-procurement", fg: "--hub-procurement-fg" },
    hr: { bg: "--hub-hr", fg: "--hub-hr-fg" },
    products: { bg: "--hub-products", fg: "--hub-products-fg" },
    kitchen: { bg: "--hub-kitchen", fg: "--hub-kitchen-fg" },
    crm: { bg: "--hub-crm", fg: "--hub-crm-fg" },
    finance: { bg: "--hub-finance", fg: "--hub-finance-fg" },
    assets: { bg: "--hub-assets", fg: "--hub-assets-fg" },
    pos: { bg: "--hub-pos", fg: "--hub-pos-fg" },
    settings: { bg: "--hub-settings", fg: "--hub-settings-fg" },
    organization: { bg: "--hub-organization", fg: "--hub-organization-fg" },
  };
  const { bg, fg } = hubVar[hubId];
  return cn(
    "font-bold hover:opacity-90 shadow-sm",
    `bg-[var(${bg})] text-[var(${fg})]`,
    className,
  );
}

export function hubCardIconFor(hubId: HubId, className?: string) {
  return cn(hubCardIconClass(hubId), className);
}

const hubSummaryToneVar: Record<HubId, { subtle: string; border: string }> = {
  inventory: { subtle: "--tone-inventory-subtle", border: "--tone-inventory-border" },
  procurement: { subtle: "--tone-procurement-subtle", border: "--tone-procurement-border" },
  hr: { subtle: "--tone-hr-subtle", border: "--tone-hr-border" },
  products: { subtle: "--tone-products-subtle", border: "--tone-products-border" },
  kitchen: { subtle: "--tone-kitchen-subtle", border: "--tone-kitchen-border" },
  crm: { subtle: "--tone-crm-subtle", border: "--tone-crm-border" },
  finance: { subtle: "--tone-finance-subtle", border: "--tone-finance-border" },
  assets: { subtle: "--tone-assets-subtle", border: "--tone-assets-border" },
  pos: { subtle: "--tone-pos-subtle", border: "--tone-pos-border" },
  settings: { subtle: "--tone-settings-subtle", border: "--tone-settings-border" },
  organization: { subtle: "--tone-organization-subtle", border: "--tone-organization-border" },
};

/** Hub-aware inline summary chip (count line badges, optional filter toggles). */
export function summaryChipClassName(hubId: HubId, active = false, className?: string) {
  const tone = hubSummaryToneVar[hubId];
  return cn(
    "rounded-md px-2 py-0.5 font-medium tabular-nums transition-colors",
    active
      ? `bg-[var(${tone.subtle})] ring-1 ring-[var(${tone.border})]`
      : `hover:bg-[var(${tone.subtle})] cursor-pointer`,
    className,
  );
}

/** @deprecated Use summaryChipClassName("kitchen", ...) */
export function kitchenSummaryChipClassName(active = false, className?: string) {
  return summaryChipClassName("kitchen", active, className);
}

export function tableActionAccentClassName(tone: MetricTone, className?: string) {
  return cn(metricValueClassName(tone), "font-bold", className);
}

export function inlineLinkClassName(className?: string) {
  return cn("font-medium text-[var(--brand-text)] hover:opacity-80", className);
}

export function expandedRowPanelClassName(className?: string) {
  return cn(
    "p-4 rounded-lg m-2 border",
    "bg-[var(--form-line-bg)] border-[var(--form-line-border)]",
    className,
  );
}

export function formSectionClassName(className?: string) {
  return cn(
    "p-4 rounded-xl border mb-6",
    "bg-[var(--form-line-bg)] border-[var(--form-line-border)]",
    className,
  );
}

export function branchCardClassName(hubId: HubId = "organization", className?: string) {
  const hubVar: Record<HubId, string> = {
    inventory: "--hub-inventory",
    procurement: "--hub-procurement",
    hr: "--hub-hr",
    products: "--hub-products",
    kitchen: "--hub-kitchen",
    crm: "--hub-crm",
    finance: "--hub-finance",
    assets: "--hub-assets",
    pos: "--hub-pos",
    settings: "--hub-settings",
    organization: "--hub-organization",
  };
  return cn(
    "rounded-xl shadow-sm border p-6 flex flex-col transition-colors",
    "bg-[var(--table-container-bg)] border-[var(--table-container-border)]",
    `hover:border-[var(${hubVar[hubId]})]/50`,
    className,
  );
}

export function emptyStatePanelClassName(className?: string) {
  return cn(
    "rounded-xl border border-dashed p-12 text-center",
    "border-[var(--table-container-border)] bg-[var(--table-container-bg)]",
    className,
  );
}

export function avatarPlaceholderClassName(className?: string) {
  return cn(
    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
    "bg-[var(--table-head-bg)]",
    className,
  );
}

export function formDashedButtonClassName(className?: string) {
  return cn("font-bold border-[var(--form-line-border)]", className);
}

export function statusInlineAlertClassName(tone: StatusTone, className?: string) {
  return cn(
    "rounded-xl border px-4 py-3 text-sm font-medium",
    statusToneClassName(tone),
    className,
  );
}

export function hubLoadingSpinnerClassName(className?: string) {
  return cn("animate-spin motion-reduce:animate-none", metricValueClassName("emerald"), className);
}
