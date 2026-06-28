import { cn } from "@/lib/utils";
import { elevatedPanelClassName } from "./surface";
import { hubCardIconClass } from "./hub-accent";
import { metricValueClassName } from "./metric";
import { text } from "./surface";

export function organizationSectionPanelClassName(className?: string) {
  return elevatedPanelClassName(cn("p-4 sm:p-6 space-y-4", className));
}

export function organizationHubIconClassName(className?: string) {
  return cn(hubCardIconClass("organization"), className);
}

export function organizationSummaryChipClassName(active = false, className?: string) {
  return cn(
    "rounded-md px-2 py-0.5 font-medium tabular-nums transition-colors",
    active
      ? "bg-[var(--tone-organization-subtle)] ring-1 ring-[var(--tone-organization-border)]"
      : "hover:bg-[var(--tone-organization-subtle)] cursor-pointer",
    className,
  );
}

export function organizationDialogContentClassName(className?: string) {
  return cn(
    "sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto",
    "bg-[var(--table-container-bg)] border-[var(--table-container-border)] text-foreground",
    className,
  );
}

export function branchLegendSwatchClassName(
  variant: "central" | "franchise",
  className?: string,
) {
  const tone =
    variant === "central"
      ? "bg-[var(--status-warning-fg)]"
      : "bg-[var(--status-neutral-fg)]";
  return cn(
    "inline-block h-3 w-3 shrink-0 rounded-sm border border-[var(--table-row-border)]",
    tone,
    className,
  );
}

export function branchCardAccentClassName(isCentralKitchen?: boolean, className?: string) {
  return cn(
    isCentralKitchen
      ? "ring-1 ring-[var(--tone-organization-border)]"
      : undefined,
    className,
  );
}

export function branchCardMetaClassName(className?: string) {
  return cn("text-sm tabular-nums", text.muted, className);
}

export function userRoleLegendSwatchClassName(
  role: "SUPER_ADMIN" | "MANAGER" | "STAFF",
  className?: string,
) {
  const tone =
    role === "SUPER_ADMIN"
      ? "bg-[var(--status-purple-fg)]"
      : role === "MANAGER"
        ? "bg-[var(--status-info-fg)]"
        : "bg-[var(--status-neutral-fg)]";
  return cn(
    "inline-block h-3 w-3 shrink-0 rounded-sm border border-[var(--table-row-border)]",
    tone,
    className,
  );
}

export function organizationDialogWideClassName(className?: string) {
  return cn(organizationDialogContentClassName("sm:max-w-xl"), className);
}
