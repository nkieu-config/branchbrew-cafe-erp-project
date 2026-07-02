import { cn } from "@/lib/utils";
import { typeMetricClassName, typeHeadingClassName, typeUiLabelClassName, typeMicroClassName } from "./typography";

export type DashboardWidgetVariant = "sales" | "branch" | "alerts" | "products" | "chart";

const widgetBorder: Record<DashboardWidgetVariant, string> = {
  sales: "border-[var(--widget-sales-border)]",
  branch: "border-[var(--widget-branch-border)]",
  alerts: "border-[var(--widget-alerts-border)]",
  products: "border-[var(--widget-products-border)]",
  chart: "border-[var(--widget-chart-border)]",
};

const widgetGradient: Record<DashboardWidgetVariant, string> = {
  sales: "bg-gradient-to-br from-[var(--surface-elevated)] to-[var(--widget-sales-bg-to)]",
  branch: "bg-gradient-to-br from-[var(--surface-elevated)] to-[var(--widget-branch-bg-to)]",
  alerts: "bg-gradient-to-br from-[var(--surface-elevated)] to-[var(--widget-alerts-bg-to)]",
  products: "bg-gradient-to-br from-[var(--surface-elevated)] to-[var(--widget-products-bg-to)]",
  chart: "bg-gradient-to-br from-[var(--surface-elevated)] to-[var(--widget-chart-bg-to)]",
};

const widgetLabel: Record<DashboardWidgetVariant, string> = {
  sales: "text-[var(--widget-sales-label)]",
  branch: "text-[var(--widget-branch-label)]",
  alerts: "text-[var(--widget-alerts-header)]",
  products: "text-[var(--widget-products-title)]",
  chart: "text-[var(--widget-chart-title)]",
};

const widgetValue: Record<DashboardWidgetVariant, string> = {
  sales: "text-[var(--widget-sales-value)]",
  branch: "text-[var(--widget-branch-value)]",
  alerts: "",
  products: "",
  chart: "",
};

export function dashboardWidgetCardClass(
  variant: DashboardWidgetVariant,
  className?: string,
) {
  return cn(
    "dashboard-widget glass-card h-full ring-0 shadow-none rounded-2xl",
    widgetBorder[variant],
    widgetGradient[variant],
    variant === "sales" && "shadow-[var(--widget-sales-shadow)]",
    className,
  );
}

export function dashboardKpiBodyClass(className?: string) {
  return cn("p-5 h-full flex flex-col justify-center", className);
}

export function dashboardWidgetHeaderClass(className?: string) {
  return cn("shrink-0 space-y-0 px-3 pt-4 pb-2 sm:px-5", className);
}

export function dashboardChartWidgetShellClass(className?: string) {
  return cn(
    "flex flex-col min-h-[340px] h-auto sm:min-h-0 sm:h-[340px] lg:h-[380px]",
    className,
  );
}

export function dashboardChartWidgetContentClass(className?: string) {
  return cn("flex-1 min-h-0 px-3 pb-3 pt-1 sm:px-5 sm:pb-4", className);
}

export function dashboardAlertCountBadgeClass(tone: "low" | "expiry" | "neutral") {
  return cn(
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
    tone === "low" && "bg-[var(--widget-alerts-low-row)] text-[var(--widget-alerts-low-value)]",
    tone === "expiry" &&
      "bg-[var(--widget-alerts-expiry-row)] text-[var(--widget-alerts-expiry-value)]",
    tone === "neutral" &&
      "bg-[var(--surface-muted)] text-[var(--widget-alerts-header)]",
  );
}

export function dashboardCustomizeHintClass(className?: string) {
  return cn(
    "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs",
    "border-[var(--dashboard-header-border)] bg-[var(--surface-elevated)] text-[var(--text-subtle)]",
    className,
  );
}

export function dashboardGridClass(className?: string) {
  return cn(
    "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 auto-rows-[minmax(128px,auto)] pb-1",
    className,
  );
}

export function dashboardSortableShellClass(isDragging: boolean, className?: string) {
  return cn(
    "group flex flex-col overflow-hidden rounded-2xl",
    "ring-1 ring-[var(--glass-card-border)] bg-[var(--surface-elevated)]/40",
    "transition-[box-shadow,ring-color] duration-200 motion-reduce:transition-none",
    isDragging && dashboardDragActiveClass(true),
    className,
  );
}

export function dashboardWidgetLabelClass(variant: DashboardWidgetVariant) {
  return cn(typeUiLabelClassName("text-sm uppercase tracking-wider"), widgetLabel[variant]);
}

export function dashboardWidgetTitleClass(variant: DashboardWidgetVariant, className?: string) {
  return cn(typeUiLabelClassName(), widgetLabel[variant], className);
}

export function dashboardWidgetValueClass(variant: DashboardWidgetVariant, className?: string) {
  return cn(typeMetricClassName(), widgetValue[variant], className);
}

export function dashboardWidgetIconSolidClass(size: "default" | "compact" = "default") {
  return cn(
    size === "compact" ? "p-3 rounded-xl shadow-md" : "p-4 rounded-2xl shadow-lg",
    "bg-[var(--brand-solid)] text-[var(--on-brand-solid-fg)]",
  );
}

export function dashboardWidgetIconSoftClass(
  variant: "branch",
  size: "default" | "compact" = "default",
) {
  return cn(
    size === "compact" ? "p-3 rounded-xl shadow-inner" : "p-4 rounded-2xl shadow-inner",
    "bg-[var(--widget-branch-icon-bg)] text-[var(--widget-branch-icon-fg)]",
  );
}

export function dashboardTrendBadgeClass(positive: boolean) {
  return cn(
    "rounded-full",
    positive
      ? "bg-[var(--status-success-bg)] text-[var(--status-success-fg)]"
      : "bg-[var(--status-danger-bg)] text-[var(--status-danger-fg)]",
  );
}

export function dashboardAlertsHeaderClass() {
  return cn(
    "pb-2 border-b shrink-0 border-[var(--widget-alerts-divider)]",
    "text-[var(--widget-alerts-header)]",
  );
}

export function dashboardAlertsRowClass(type: "low" | "expiry") {
  return cn(
    "p-3 flex justify-between items-center transition-colors",
    type === "low"
      ? "bg-[var(--widget-alerts-low-row)] hover:bg-[var(--widget-alerts-low-row-hover)]"
      : "bg-[var(--widget-alerts-expiry-row)] hover:bg-[var(--widget-alerts-expiry-row-hover)]",
  );
}

export function dashboardAlertsEmptyClass() {
  return cn(
    "p-6 text-center flex flex-col items-center justify-center h-full text-muted-foreground",
  );
}

export function dashboardSkeletonClass(className?: string) {
  return cn(
    "animate-pulse motion-reduce:animate-none rounded-xl bg-[var(--widget-skeleton)]",
    className,
  );
}

export function dashboardChartEmptyClass(className?: string) {
  return cn(
    "flex h-full min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-8 text-center",
    "border-[var(--table-container-border)] bg-[var(--table-container-bg)]",
    className,
  );
}

export function dashboardAlertsFooterClass() {
  return cn(
    "border-t shrink-0 p-3 flex flex-wrap gap-2 justify-end",
    "border-[var(--widget-alerts-divider)]",
  );
}

export function dashboardAlertsFooterLinkClass() {
  return cn(
    "text-sm font-semibold underline-offset-4 hover:underline",
    "text-[var(--widget-alerts-header)]",
  );
}

export function dashboardErrorMessageClass(className?: string) {
  return cn("text-sm font-medium text-[var(--status-danger-fg)]", className);
}

export function dashboardErrorPanelClass(className?: string) {
  return cn(
    "h-full min-h-[200px] flex flex-col items-center justify-center gap-3 rounded-xl border p-6 text-center",
    "bg-[var(--widget-error-bg)] border-[var(--widget-error-border)]",
    className,
  );
}

export function dashboardWidgetErrorIconClassName(className?: string) {
  return cn("text-[var(--widget-error-icon)]", className);
}

export function dashboardAlertsLowValueClassName(className?: string) {
  return cn(typeMetricClassName(), "text-[var(--widget-alerts-low-value)]", className);
}

export function dashboardAlertsLowMetaClassName(className?: string) {
  return cn(
    typeUiLabelClassName("tracking-wider text-[var(--widget-alerts-low-meta)]"),
    className,
  );
}

export function dashboardAlertsExpiryValueClassName(className?: string) {
  return cn(typeMetricClassName(), "text-[var(--widget-alerts-expiry-value)]", className);
}

export function dashboardAlertsExpiryMetaClassName(className?: string) {
  return cn(
    typeUiLabelClassName("tracking-wider text-[var(--widget-alerts-expiry-meta)]"),
    className,
  );
}

export function dashboardAlertsEmptyIconClassName(className?: string) {
  return cn("text-[var(--widget-alerts-empty-icon)]", className);
}

export function dashboardAlertsEmptyTextClassName(className?: string) {
  return cn(typeHeadingClassName("text-lg text-[var(--widget-alerts-empty-text)]"), className);
}

export function dashboardDragActiveClass(isDragging: boolean) {
  return isDragging
    ? "shadow-2xl ring-2 ring-[var(--widget-drag-ring)] rounded-2xl opacity-90"
    : "";
}

export function dashboardDragHandleBarClass() {
  return cn(
    "dashboard-drag-handle flex shrink-0 items-center justify-center gap-1.5",
    "h-6 w-full cursor-grab active:cursor-grabbing touch-manipulation",
    "rounded-t-2xl border-b border-border/40",
    "text-[var(--widget-drag-handle-fg)] bg-[var(--widget-drag-handle-bg)]",
    "hover:bg-[var(--widget-drag-handle-hover)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--widget-drag-ring)]",
    typeMicroClassName("uppercase tracking-wider font-medium"),
  );
}

export function dashboardHeaderClass(className?: string) {
  return cn(
    "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4",
    "border-[var(--dashboard-header-border)]",
    className,
  );
}

export function dashboardBranchBadgeClass(className?: string) {
  return cn(
    "text-sm font-semibold px-4 py-2 rounded-xl",
    "bg-[var(--dashboard-badge-bg)] text-[var(--dashboard-badge-fg)]",
    className,
  );
}

export function dashboardBranchBadgeAccentClass() {
  return "text-[var(--dashboard-badge-accent)]";
}

/** Dashboard shell h1 icon — matches hub page header scale. */
export function dashboardShellIconClassName(className?: string) {
  return cn("text-[var(--dashboard-badge-accent)]", className);
}
