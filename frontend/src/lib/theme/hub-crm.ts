import { cn } from "@/lib/utils";
import type { StatusTone } from "./status";
import { statusToneClassName } from "./status";
import { metricValueClassName } from "./metric";
import { text } from "./surface";
import { typeMetricClassName } from "./typography";

export { crmSectionPanelClassName } from "./hub-section-aliases";

/** @deprecated Use listToolbarFieldClassName from @/lib/theme/hub-primitives instead. */
export function crmSearchInputClassName(className?: string) {
  return cn(
    "pl-9 bg-[var(--table-container-bg)] border-[var(--table-container-border)]",
    className,
  );
}

export function crmPointsClassName(className?: string) {
  return typeMetricClassName(cn("text-lg", metricValueClassName("emerald"), className));
}

export function crmPointsSuffixClassName(className?: string) {
  return cn("text-xs font-bold opacity-70", metricValueClassName("emerald"), className);
}

export function crmInsightPanelClassName(className?: string) {
  return cn(
    "rounded-2xl p-5 border",
    "bg-[var(--form-line-bg)] border-[var(--form-line-border)]",
    className,
  );
}

export function crmSectionLabelClassName(className?: string) {
  return cn("text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2", text.muted, className);
}

export function crmFavoriteChipClassName(className?: string) {
  return cn(
    "flex items-center gap-2 px-3 py-1.5 rounded-full border",
    "bg-[var(--tone-crm-subtle)] border-[var(--tone-crm-border)]",
    className,
  );
}

export function crmFavoriteCountClassName(className?: string) {
  return cn(
    "text-xs font-bold px-2 py-0.5 rounded-full tabular-nums",
    "bg-[var(--tone-crm-border)] text-[var(--tone-crm-fg)]",
    className,
  );
}

export function crmOrderCardClassName(className?: string) {
  return cn(
    "flex justify-between items-center p-3 rounded-xl border shadow-sm",
    "bg-[var(--table-container-bg)] border-[var(--table-container-border)]",
    className,
  );
}

export function crmOrderIconWrapClassName(className?: string) {
  return cn("p-2 rounded-lg bg-[var(--table-head-bg)]", text.muted, className);
}

export function crmMaxTierBadgeClassName(className?: string) {
  return cn(
    "mt-3 text-sm font-bold p-2 rounded-lg text-center uppercase tracking-wider",
    statusToneClassName("purple"),
    className,
  );
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
    "sm:max-w-md rounded-2xl",
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
