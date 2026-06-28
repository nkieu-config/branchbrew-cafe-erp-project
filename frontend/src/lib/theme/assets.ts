import { cn } from "@/lib/utils";
import { elevatedPanelClassName } from "./surface";
import { hubCardIconClass } from "./hub-accent";
import { metricValueClassName } from "./metric";
import { text } from "./surface";

export function assetsSectionPanelClassName(className?: string) {
  return elevatedPanelClassName(cn("p-4 sm:p-6 space-y-4", className));
}

export function assetsHubIconClassName(className?: string) {
  return cn(hubCardIconClass("assets"), className);
}

export function assetsSummaryChipClassName(active = false, className?: string) {
  return cn(
    "rounded-md px-2 py-0.5 font-medium tabular-nums transition-colors",
    active
      ? "bg-[var(--tone-assets-subtle)] ring-1 ring-[var(--tone-assets-border)]"
      : "hover:bg-[var(--tone-assets-subtle)] cursor-pointer",
    className,
  );
}

export function assetsMetaBadgeClassName(className?: string) {
  return cn(
    "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium uppercase tracking-wide",
    "bg-[var(--tone-assets-subtle)] text-[var(--tone-assets-fg)] border-[var(--tone-assets-border)]",
    className,
  );
}

export function assetsDialogContentClassName(className?: string) {
  return cn(
    "sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto",
    "bg-[var(--table-container-bg)] border-[var(--table-container-border)] text-foreground",
    className,
  );
}

export function equipmentLegendSwatchClassName(
  variant: "active" | "maintenance" | "broken" | "retired" | "due-soon",
  className?: string,
) {
  const tone =
    variant === "active"
      ? "bg-[var(--status-success-fg)]"
      : variant === "maintenance"
        ? "bg-[var(--status-warning-fg)]"
        : variant === "broken"
          ? "bg-[var(--status-danger-fg)]"
          : variant === "due-soon"
            ? "bg-[var(--status-warning-fg)]"
            : "bg-[var(--status-neutral-fg)]";
  return cn(
    "inline-block h-3 w-3 shrink-0 rounded-sm border border-[var(--table-row-border)]",
    tone,
    className,
  );
}

export function equipmentMaintenanceDueRowClassName(className?: string) {
  return cn("bg-[var(--status-warning-bg)]/45", className);
}

export function equipmentMaintenanceOverdueRowClassName(className?: string) {
  return cn("bg-[var(--status-danger-bg)]/45", className);
}

export function equipmentMaintenanceDateClassName(
  overdue: boolean,
  dueSoon: boolean,
  className?: string,
) {
  if (overdue) {
    return cn("font-medium tabular-nums", metricValueClassName("red"), className);
  }
  if (dueSoon) {
    return cn("font-medium tabular-nums", metricValueClassName("amber"), className);
  }
  return cn("tabular-nums", text.muted, className);
}
