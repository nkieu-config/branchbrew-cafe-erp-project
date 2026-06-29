import type { HubId } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { hubCardIconClass } from "./hub-accent";

export type StatusTextTone = "warning" | "danger" | "info" | "success";

const statusTextClass: Record<StatusTextTone, string> = {
  warning: "text-[var(--status-warning-fg)]",
  danger: "text-[var(--status-danger-fg)]",
  info: "text-[var(--status-info-fg)]",
  success: "text-[var(--status-success-fg)]",
};

/** Inline status-colored text (form hints, ledger labels) — prefer over raw CSS vars. */
export function statusTextClassName(tone: StatusTextTone, className?: string) {
  return cn(statusTextClass[tone], className);
}

/** Validation / blocking hint below form line editors. */
export function formValidationHintClassName(
  tone: Extract<StatusTextTone, "warning" | "danger"> = "warning",
  className?: string,
) {
  return statusTextClassName(tone, cn("text-sm", className));
}

/** Invalid field border ring — pairs with shadcn Input/Select inset fields. */
export function formFieldInvalidClassName(invalid?: boolean, className?: string) {
  return cn(
    invalid &&
      "border-[var(--form-field-invalid-border)] ring-[var(--form-field-invalid-ring)]",
    className,
  );
}

/** Inline field error message below inputs. */
export function formFieldErrorMessageClassName(className?: string) {
  return formValidationHintClassName("danger", className);
}

/** Read-only context strip inside forms (preview codes, branch notes). */
export function formContextBannerClassName(className?: string) {
  return cn(
    "rounded-lg border",
    "bg-[var(--form-line-bg)] border-[var(--form-line-border)]",
    className,
  );
}

/** Modal / sheet title icon — hub accent via Tailwind `text-hub-*-icon` bridge. */
export function hubModalIconClassName(hubId: HubId, className?: string) {
  return hubCardIconClass(hubId, className);
}

/** Default modal icon when no hub context (settings-style dialogs). */
export function formModalDefaultIconClassName(className?: string) {
  return cn("w-5 h-5 text-[var(--metric-indigo)]", className);
}

/** Search, inbox, chart empty icons. */
export function decorativeIconClassName(className?: string) {
  return cn("text-[var(--text-subtle)]", className);
}

export function emptyStateIconClassName(className?: string) {
  return cn("text-[var(--state-empty-icon)]", className);
}

export function accessDeniedIconClassName(className?: string) {
  return cn("text-[var(--state-denied-icon)]", className);
}

/** Row / section dividers inside cards and POS cart lines. */
export function tableRowDividerClassName(className?: string) {
  return cn("border-[var(--table-row-border)]", className);
}

/** Skeleton / loading blocks on inset surfaces. */
export function surfaceInsetSkeletonClassName(className?: string) {
  return cn(
    "bg-[var(--surface-inset)] animate-pulse motion-reduce:animate-none",
    className,
  );
}
