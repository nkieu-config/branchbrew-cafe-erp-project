import { cn } from "@/lib/utils";
import { text } from "./surface";

/** Inline recoverable query error — use with QueryErrorBanner. */
export function queryErrorBannerClassName(className?: string) {
  return cn(
    "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3",
    "rounded-xl border p-4",
    "bg-[var(--status-danger-bg)] border-[var(--status-danger-border)]",
    className,
  );
}

export function queryErrorMessageClassName(className?: string) {
  return cn("text-sm font-medium", text.primary, className);
}

/** List page toolbar shell — search, filters, branch scope. */
export function listToolbarClassName(className?: string) {
  return cn(
    "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
    "mb-4 rounded-xl border px-4 py-3",
    "bg-[var(--surface-inset)] border-[var(--border)]",
    className,
  );
}

export function listToolbarSearchClassName(className?: string) {
  return cn("w-full sm:max-w-xs min-h-[44px]", className);
}

/** Elevated field surface inside list toolbars — matches form-field-inset tokens. */
export function listToolbarFieldClassName(className?: string) {
  return cn("form-field-inset rounded-xl", className);
}

export function listToolbarFiltersClassName(className?: string) {
  return cn("flex flex-wrap items-center gap-2", className);
}

/** Branch scope pill shown above data tables. */
export function branchScopeIndicatorClassName(className?: string) {
  return cn(
    "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium",
    "bg-[var(--tone-blue-subtle)] border-[var(--tone-blue-border)] text-[var(--tone-blue-fg-strong)]",
    className,
  );
}

export function branchScopeAllClassName(className?: string) {
  return cn(
    "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium",
    "bg-[var(--surface-inset)] border-[var(--border)] text-[var(--text-secondary)]",
    className,
  );
}

/** Muted text inside table cells — better dark-mode contrast than text.muted alone. */
export function tableCellMutedClassName(className?: string) {
  return cn("text-[var(--table-cell-muted-fg)]", className);
}
