import { cn } from "@/lib/utils";

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
  products: "",
  chart: "",
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
    "glass-card h-full",
    widgetBorder[variant],
    widgetGradient[variant],
    variant === "sales" && "shadow-[var(--widget-sales-shadow)]",
    className,
  );
}

export function dashboardWidgetLabelClass(variant: DashboardWidgetVariant) {
  return cn("text-sm font-bold uppercase tracking-wider", widgetLabel[variant]);
}

export function dashboardWidgetTitleClass(variant: DashboardWidgetVariant, className?: string) {
  return cn("font-black", widgetLabel[variant], className);
}

export function dashboardWidgetValueClass(variant: DashboardWidgetVariant, className?: string) {
  return cn("font-black", widgetValue[variant], className);
}

export function dashboardWidgetIconSolidClass() {
  return cn(
    "p-4 rounded-2xl shadow-lg",
    "bg-[var(--brand-solid)] text-[var(--on-brand-solid-fg)]",
  );
}

export function dashboardWidgetIconSoftClass(variant: "branch") {
  return cn(
    "p-4 rounded-2xl shadow-inner",
    "bg-[var(--widget-branch-icon-bg)] text-[var(--widget-branch-icon-fg)]",
  );
}

export function dashboardTrendBadgeClass(positive: boolean) {
  return positive
    ? "bg-[var(--status-success-bg)] text-[var(--status-success-fg)]"
    : "bg-[var(--status-danger-bg)] text-[var(--status-danger-fg)]";
}

export function dashboardAlertsHeaderClass() {
  return cn(
    "pb-3 border-b shrink-0 border-[var(--widget-alerts-divider)]",
    "text-[var(--widget-alerts-header)]",
  );
}

export function dashboardAlertsRowClass(type: "low" | "expiry") {
  return cn(
    "p-4 flex justify-between items-center",
    type === "low" ? "bg-[var(--widget-alerts-low-row)]" : "bg-[var(--widget-alerts-expiry-row)]",
  );
}

export function dashboardAlertsEmptyClass() {
  return cn(
    "p-6 text-center flex flex-col items-center justify-center h-full text-muted-foreground",
  );
}

export function dashboardSkeletonClass(className?: string) {
  return cn("animate-pulse rounded-xl bg-[var(--widget-skeleton)]", className);
}

export function dashboardErrorPanelClass(className?: string) {
  return cn(
    "h-full min-h-[200px] flex flex-col items-center justify-center gap-3 rounded-xl border p-6 text-center",
    "bg-[var(--widget-error-bg)] border-[var(--widget-error-border)]",
    className,
  );
}

export function dashboardDragActiveClass(isDragging: boolean) {
  return isDragging
    ? "shadow-2xl ring-2 ring-[var(--widget-drag-ring)] rounded-xl opacity-80"
    : "";
}

export function dashboardDragHandleClass() {
  return cn(
    "absolute top-4 right-4 z-20 p-2 cursor-grab active:cursor-grabbing transition-opacity",
    "opacity-0 group-hover:opacity-100 backdrop-blur rounded-md border shadow-sm",
    "text-[var(--widget-drag-handle-fg)] bg-[var(--widget-drag-handle-bg)]",
    "hover:bg-[var(--widget-drag-handle-hover)] border-border",
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
