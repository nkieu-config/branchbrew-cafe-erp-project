import { cn } from "@/lib/utils";
import { dashboardErrorPanelClass } from "./dashboard";
import { metricValueClassName } from "./metric";
import { hubCardIconClass } from "./hub-accent";
import { elevatedPanelClassName, text } from "./surface";

export function ledgerDebitClassName(className?: string) {
  return cn("font-bold text-[var(--ledger-debit-fg)]", className);
}

export function ledgerCreditClassName(className?: string) {
  return cn("font-bold text-[var(--ledger-credit-fg)]", className);
}

export function ledgerPanelClassName(className?: string) {
  return elevatedPanelClassName(cn("p-6", className));
}

/** Solid elevated panel for finance sections (replaces glass on light). */
export function financeSectionPanelClassName(className?: string) {
  return ledgerPanelClassName(className);
}

export function financeSectionTitleClassName(className?: string) {
  return cn("font-semibold text-lg mb-4 flex items-center gap-2", text.primary, className);
}

export function financeHubIconClassName(className?: string) {
  return cn(hubCardIconClass("finance"), className);
}

export function financeMetricIconClassName(tone: "emerald" | "amber" | "indigo", className?: string) {
  return cn(metricValueClassName(tone), className);
}

export function financePrimaryActionClassName(className?: string) {
  return cn(
    "bg-[var(--brand-solid)] text-[var(--on-brand-solid-fg)] hover:opacity-90 shadow-sm border-none",
    className,
  );
}

export function financeErrorBannerClassName(className?: string) {
  return dashboardErrorPanelClass(
    cn("flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4", className),
  );
}

export function settlementDifferenceClassName(difference: number, className?: string) {
  return cn(
    "px-4 py-3 text-right tabular-nums font-medium",
    difference < 0
      ? metricValueClassName("red")
      : difference > 0
        ? metricValueClassName("emerald")
        : text.muted,
    className,
  );
}

export function financeApproveButtonClassName(className?: string) {
  return cn(
    "text-[var(--brand-text)] hover:bg-[var(--status-success-bg)]",
    className,
  );
}

export function financeExpenseAmountClassName(className?: string) {
  return cn("px-4 py-3 text-right font-medium tabular-nums", metricValueClassName("red"), className);
}

export function financeSummaryChipClassName(active = false, className?: string) {
  return cn(
    "rounded-md px-2 py-0.5 font-medium tabular-nums transition-colors",
    active
      ? "bg-[var(--tone-finance-subtle)] ring-1 ring-[var(--tone-finance-border)]"
      : "hover:bg-[var(--tone-finance-subtle)] cursor-pointer",
    className,
  );
}

export function settlementLegendSwatchClassName(
  status: "PENDING" | "APPROVED" | "REJECTED",
  className?: string,
) {
  const tone =
    status === "APPROVED"
      ? "bg-[var(--status-success-fg)]"
      : status === "REJECTED"
        ? "bg-[var(--status-danger-fg)]"
        : "bg-[var(--status-warning-fg)]";
  return cn(
    "inline-block h-3 w-3 shrink-0 rounded-sm border border-[var(--table-row-border)]",
    tone,
    className,
  );
}

export function journalLegendSwatchClassName(
  status: "DRAFT" | "POSTED",
  className?: string,
) {
  const tone =
    status === "POSTED"
      ? "bg-[var(--status-success-fg)]"
      : "bg-[var(--status-warning-fg)]";
  return cn(
    "inline-block h-3 w-3 shrink-0 rounded-sm border border-[var(--table-row-border)]",
    tone,
    className,
  );
}

export function accountLegendSwatchClassName(
  type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE",
  className?: string,
) {
  const tone =
    type === "ASSET"
      ? "bg-[var(--status-info-fg)]"
      : type === "LIABILITY"
        ? "bg-[var(--status-danger-fg)]"
        : type === "EQUITY"
          ? "bg-[var(--status-purple-fg)]"
          : type === "REVENUE"
            ? "bg-[var(--status-success-fg)]"
            : "bg-[var(--status-warning-fg)]";
  return cn(
    "inline-block h-3 w-3 shrink-0 rounded-sm border border-[var(--table-row-border)]",
    tone,
    className,
  );
}
