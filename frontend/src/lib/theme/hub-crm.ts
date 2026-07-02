import { cn } from "@/lib/utils";
import type { StatusTone } from "./status";
import { metricValueClassName } from "./metric";
import { text } from "./surface";

export { crmSectionPanelClassName } from "./hub-panel";

export function crmPointsClassName(className?: string) {
  return cn("tabular-nums font-semibold", text.primary, className);
}

export function crmPointsSuffixClassName(className?: string) {
  return cn("text-xs font-normal", text.muted, className);
}

export function crmInsightPanelClassName(className?: string) {
  return cn("rounded-xl p-4 bg-[var(--table-container-bg)]/60", className);
}

export function crmSectionLabelClassName(className?: string) {
  return cn("text-sm font-medium mb-2", text.muted, className);
}

export function crmFavoriteChipClassName(className?: string) {
  return cn("text-sm", text.secondary, className);
}

export function crmFavoriteCountClassName(className?: string) {
  return cn("tabular-nums", text.muted, className);
}

export function crmOrderCardClassName(className?: string) {
  return cn(
    "flex justify-between items-center py-3 border-b border-[var(--table-row-border)] last:border-0",
    className,
  );
}

export function crmOrderIconWrapClassName(className?: string) {
  return cn(text.muted, className);
}

export function crmMaxTierBadgeClassName(className?: string) {
  return cn("mt-2 text-sm font-medium text-center", text.muted, className);
}

export function crmProgressClassName(className?: string) {
  return cn(
    "h-2 mt-3",
    "[&_[data-slot=progress-track]]:bg-[var(--form-line-bg)]",
    "[&_[data-slot=progress-indicator]]:bg-[var(--hub-crm)]",
    className,
  );
}

export function crmSheetContentClassName(className?: string) {
  return cn(
    "bg-[var(--table-container-bg)] text-foreground border-[var(--table-container-border)]",
    className,
  );
}

export function crmDialogContentClassName(className?: string) {
  return cn(
    "sm:max-w-md rounded-xl",
    "bg-[var(--table-container-bg)] border-[var(--table-container-border)] text-foreground",
    className,
  );
}

export function customerTierTone(tier: string): StatusTone {
  switch (tier?.toUpperCase()) {
    case "PLATINUM":
      return "purple";
    case "GOLD":
      return "warning";
    case "SILVER":
      return "neutral";
    default:
      return "info";
  }
}

export function churnRiskTone(risk: string): StatusTone {
  switch (risk?.toUpperCase()) {
    case "LOW":
      return "success";
    case "MEDIUM":
      return "warning";
    case "HIGH":
      return "danger";
    default:
      return "neutral";
  }
}

export function customerTierIconClassName(tier: string, className?: string) {
  switch (tier?.toUpperCase()) {
    case "PLATINUM":
      return cn(metricValueClassName("purple"), className);
    case "GOLD":
      return cn(metricValueClassName("amber"), className);
    case "SILVER":
      return cn(text.muted, className);
    default:
      return cn(metricValueClassName("blue"), className);
  }
}
