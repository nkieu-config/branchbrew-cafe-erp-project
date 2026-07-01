import { cn } from "@/lib/utils";
import { dashboardErrorPanelClass } from "./dashboard";
import { hubIconClassName, hubSectionPanelClassName } from "./hub-panel";
import { elevatedPanelClassName, text } from "./surface";

export function ledgerDebitClassName(className?: string) {
  return cn("tabular-nums text-[var(--ledger-debit-fg)]", className);
}

export function ledgerCreditClassName(className?: string) {
  return cn("tabular-nums text-[var(--ledger-credit-fg)]", className);
}

export function ledgerPanelClassName(className?: string) {
  return elevatedPanelClassName(cn("p-6", className));
}

export function financeSectionPanelClassName(className?: string) {
  return hubSectionPanelClassName("finance", className);
}

export function financeSectionLabelClassName(className?: string) {
  return cn(
    "text-sm font-medium mb-3 pb-2 border-b border-[var(--table-row-border)]",
    text.secondary,
    className,
  );
}

export function financeSectionTitleClassName(className?: string) {
  return cn("text-sm font-medium mb-3", text.secondary, className);
}

export function financeHubIconClassName(className?: string) {
  return hubIconClassName("finance", className);
}

export function financeMetricIconClassName(tone: "emerald" | "amber" | "indigo", className?: string) {
  return cn(className);
}

export function financeMutedMetaClassName(className?: string) {
  return cn("text-sm", text.muted, className);
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
    "tabular-nums",
    difference < 0
      ? "text-[var(--status-danger-fg)]"
      : difference > 0
        ? "text-[var(--status-success-fg)]"
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
  return cn("tabular-nums font-medium", text.primary, className);
}
