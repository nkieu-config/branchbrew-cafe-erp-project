import { cn } from "@/lib/utils";
import { elevatedPanelClassName } from "./surface";
import { hubCardIconClass } from "./hub-accent";

export function settingsSectionPanelClassName(className?: string) {
  return elevatedPanelClassName(cn("p-4 sm:p-6 space-y-4", className));
}

export function settingsHubIconClassName(className?: string) {
  return cn(hubCardIconClass("settings"), className);
}

export function settingsSummaryChipClassName(active = false, className?: string) {
  return cn(
    "rounded-md px-2 py-0.5 font-medium tabular-nums transition-colors",
    active
      ? "bg-[var(--tone-settings-subtle)] ring-1 ring-[var(--tone-settings-border)]"
      : "hover:bg-[var(--tone-settings-subtle)] cursor-pointer",
    className,
  );
}

export function auditLegendSwatchClassName(
  variant: "create" | "update" | "delete" | "approve" | "other",
  className?: string,
) {
  const tone =
    variant === "create"
      ? "bg-[var(--status-info-fg)]"
      : variant === "update"
        ? "bg-[var(--status-warning-fg)]"
        : variant === "delete"
          ? "bg-[var(--status-danger-fg)]"
          : variant === "approve"
            ? "bg-[var(--status-success-fg)]"
            : "bg-[var(--status-neutral-fg)]";
  return cn(
    "inline-block h-3 w-3 shrink-0 rounded-sm border border-[var(--table-row-border)]",
    tone,
    className,
  );
}

export function settingsSheetContentClassName(className?: string) {
  return cn(
    "bg-[var(--table-container-bg)] text-foreground border-[var(--table-container-border)]",
    className,
  );
}
