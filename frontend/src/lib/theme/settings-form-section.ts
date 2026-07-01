/**
 * Settings form section chrome — divider sections inside settings tabs.
 * Not for hub list panels or sheets; use `settings-hub-chrome.ts` for those.
 */
import { cn } from "@/lib/utils";
import { text } from "./surface";

export function settingsSectionLabelClassName(className?: string) {
  return cn(
    "text-sm font-medium mb-3 pb-2 border-b border-[var(--table-row-border)]",
    text.secondary,
    className,
  );
}

/** @deprecated Use settingsSectionLabelClassName with a single panel layout */
export function settingsSectionClassName(className?: string) {
  return cn("space-y-4", className);
}

/** @deprecated Use settingsSectionLabelClassName */
export function settingsSectionHeaderClassName(className?: string) {
  return cn("mb-3", className);
}

/** @deprecated Use settingsSectionLabelClassName */
export function settingsSectionTitleClassName(className?: string) {
  return cn("text-sm font-medium", text.secondary, className);
}
