import { cn } from "@/lib/utils";
import type { MetricTone } from "./metric";
import { metricValueClassName } from "./metric";
import type { StatusTone } from "./status";
import { hubCardIconClass } from "./hub-accent";
import { text } from "./surface";

export type StockLevel = "out" | "low" | "ok";

export type ExpiryUrgency = "expired" | "critical" | "warning" | "notice" | "safe";

export function stockLevel(stock: number, minStock: number): StockLevel {
  if (stock <= 0) return "out";
  if (stock <= minStock) return "low";
  return "ok";
}

export function stockLevelMetricTone(level: StockLevel): MetricTone {
  switch (level) {
    case "out":
      return "red";
    case "low":
      return "amber";
    default:
      return "emerald";
  }
}

export function stockLevelStatusTone(level: StockLevel): StatusTone {
  switch (level) {
    case "out":
      return "danger";
    case "low":
      return "warning";
    default:
      return "success";
  }
}

export function stockLevelValueClassName(level: StockLevel, className?: string) {
  return cn("font-bold tabular-nums", metricValueClassName(stockLevelMetricTone(level)), className);
}

export function stockLevelIconClassName(level: StockLevel, className?: string) {
  if (level === "ok") return className ?? "";
  return cn(metricValueClassName(stockLevelMetricTone(level)), className);
}

export function expiryUrgency(daysLeft: number): ExpiryUrgency {
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 1) return "critical";
  if (daysLeft <= 3) return "warning";
  if (daysLeft <= 7) return "notice";
  return "safe";
}

const expiryCellClass: Record<ExpiryUrgency, string> = {
  expired: "bg-[var(--expiry-expired-bg)] text-[var(--expiry-expired-fg)]",
  critical:
    "bg-[var(--expiry-critical-bg)] text-[var(--expiry-critical-fg)] animate-pulse motion-reduce:animate-none shadow-[var(--expiry-critical-bg)]/50 shadow-md",
  warning: "bg-[var(--expiry-warning-bg)] text-[var(--expiry-warning-fg)] shadow-[var(--expiry-warning-bg)]/30 shadow-md",
  notice: "bg-[var(--expiry-notice-bg)] text-[var(--expiry-notice-fg)]",
  safe: "bg-[var(--expiry-safe-bg)] text-[var(--expiry-safe-fg)]",
};

export function expiryCellClassName(urgency: ExpiryUrgency, className?: string) {
  return cn(
    "w-full h-full flex flex-col items-center justify-center rounded-lg p-1 mt-1 cursor-pointer transition-transform hover:scale-110 motion-reduce:hover:scale-100",
    expiryCellClass[urgency],
    className,
  );
}

export function expiryLegendDotClassName(urgency: ExpiryUrgency, className?: string) {
  const base = "w-3 h-3 rounded-full shadow-sm";
  switch (urgency) {
    case "critical":
      return cn(base, "bg-[var(--expiry-critical-bg)] animate-pulse motion-reduce:animate-none shadow-[var(--expiry-critical-bg)]", className);
    case "warning":
      return cn(base, "bg-[var(--expiry-warning-bg)] shadow-[var(--expiry-warning-bg)]", className);
    case "notice":
      return cn(base, "bg-[var(--expiry-notice-bg)]", className);
    default:
      return cn(base, className);
  }
}

export function expiryDateTextClassName(expired: boolean, expiringSoon: boolean, className?: string) {
  return cn(
    "text-sm font-medium",
    expired
      ? "text-[var(--metric-red)]"
      : expiringSoon
        ? "text-[var(--metric-amber)]"
        : text.subtle,
    className,
  );
}

export function formLineRowClassName(className?: string) {
  return cn(
    "flex items-end gap-4 p-4 rounded-lg border",
    "bg-[var(--form-line-bg)] border-[var(--form-line-border)]",
    className,
  );
}

export function formRemoveButtonClassName(className?: string) {
  return cn(
    "text-[var(--status-danger-fg)] hover:bg-[var(--status-danger-bg)]",
    className,
  );
}

export function formPanelClassName(className?: string) {
  return cn(
    "rounded-xl shadow-sm border p-6 max-w-4xl",
    "bg-[var(--table-container-bg)] border-[var(--table-container-border)]",
    className,
  );
}

export function formPanelHeaderClassName(className?: string) {
  return cn(
    "mb-6 border-b pb-4 border-[var(--table-row-border)]",
    className,
  );
}

export function formFieldInsetClassName(className?: string) {
  return cn("h-11 rounded-xl bg-[var(--form-line-bg)]", className);
}

export function expiryHeatmapPanelClassName(className?: string) {
  return cn(
    "rounded-2xl shadow-sm border p-1 h-full",
    "bg-[var(--table-container-bg)] border-[var(--table-container-border)]",
    className,
  );
}

export function expiryHeatmapHeaderClassName(className?: string) {
  return cn(
    "p-4 rounded-t-xl font-black flex items-center gap-2",
    "bg-[var(--expiry-panel-header-bg)] text-[var(--expiry-panel-header-fg)]",
    className,
  );
}

export function inventoryLinkCardClassName(className?: string) {
  return cn(
    "flex items-center justify-between gap-4 rounded-xl border p-4 shadow-sm transition-colors",
    "bg-[var(--table-container-bg)] border-[var(--table-container-border)]",
    "hover:border-[var(--brand)]",
    className,
  );
}

export function inventoryLinkIconWrapClassName(className?: string) {
  return cn(
    "flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--status-success-bg)]",
    className,
  );
}

export function inventoryHubIconClassName(className?: string) {
  return cn(hubCardIconClass("inventory"), className);
}

export function procurementHubIconClassName(className?: string) {
  return cn(hubCardIconClass("procurement"), className);
}

export function hubPrimaryActionClassName(className?: string) {
  return cn(
    "bg-[var(--brand-solid)] text-[var(--on-brand-solid-fg)] hover:opacity-90 shadow-sm",
    className,
  );
}

export function hubDangerActionClassName(className?: string) {
  return cn(
    "bg-[var(--status-danger-fg)] text-[var(--on-danger-solid-fg)] hover:opacity-90",
    className,
  );
}

export function hubInfoActionClassName(className?: string) {
  return cn(
    "bg-[var(--metric-indigo)] text-[var(--on-metric-indigo-fg)] hover:opacity-90",
    className,
  );
}

export function compactPanelLinkClassName(className?: string) {
  return cn(
    "inline-flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-md",
    text.subtle,
    "hover:text-foreground hover:bg-[var(--table-row-hover)]",
    className,
  );
}
