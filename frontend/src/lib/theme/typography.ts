import { cn } from "@/lib/utils";
import { text } from "./surface";

/**
 * Typography scale
 * - font-semibold → UI labels, section labels, table helpers
 * - font-bold     → headings, dialog titles, emphasis in panels
 * - font-black    → dashboard widget metrics only (via typeMetricClassName)
 */

/** Section / field labels, filter groups, compact UI labels. */
export function typeUiLabelClassName(className?: string) {
  return cn("font-semibold", className);
}

/** Uppercase tracked labels (dt, CRM section headers, audit fields). */
export function typeSectionLabelClassName(className?: string) {
  return cn("text-xs font-semibold uppercase tracking-wide", text.muted, className);
}

/** Page, panel, sheet, and dialog titles. */
export function typeHeadingClassName(className?: string) {
  return cn("font-bold", text.primary, className);
}

/** Hero stats on dashboard widgets — not for CRM sheets or list pages. */
export function typeMetricClassName(className?: string) {
  return cn("font-black tabular-nums", className);
}

/** Minimum readable caption (12px) — use instead of legacy text-[10px]. */
export function typeMicroClassName(className?: string) {
  return cn("text-xs", className);
}

/** WCAG-friendly minimum touch target for icon buttons and compact actions. */
export function touchTargetClassName(className?: string) {
  return cn("min-h-[44px] min-w-[44px]", className);
}

/** Shared shadcn Dialog shell for wide form modals (replaces antd FormModal). */
export function formDialogContentClassName(width: number | string = 800, className?: string) {
  const maxWidth = typeof width === "number" ? `sm:max-w-[${width}px]` : width;
  return cn(
    "rounded-2xl max-h-[90vh] overflow-y-auto gap-0 p-6",
    "bg-[var(--table-container-bg)] border-[var(--table-container-border)] text-foreground",
    maxWidth,
    className,
  );
}

/** Standard dialog radius token (matches --radius tier: dialog = 2xl). */
export function radiusDialogClassName(className?: string) {
  return cn("rounded-2xl", className);
}

/** Panel / section card radius (tier: xl). */
export function radiusPanelClassName(className?: string) {
  return cn("rounded-xl", className);
}

/** Control radius (tier: lg — buttons, inputs). */
export function radiusControlClassName(className?: string) {
  return cn("rounded-lg", className);
}
