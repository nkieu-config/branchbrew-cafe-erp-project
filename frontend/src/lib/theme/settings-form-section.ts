/**
 * Settings form section chrome — bordered blocks inside settings tabs.
 * Not for hub list panels or sheets; use `settings-hub-chrome.ts` for those.
 */
import { cn } from "@/lib/utils";
import { text } from "./surface";

export function settingsSectionClassName(className?: string) {
  return cn(
    "rounded-xl shadow-sm border p-6 space-y-6",
    "bg-[var(--table-container-bg)] border-[var(--table-container-border)]",
    className,
  );
}

export function settingsSectionHeaderClassName(className?: string) {
  return cn(
    "flex items-center gap-2 border-b pb-4 border-[var(--table-row-border)]",
    className,
  );
}

export function settingsSectionTitleClassName(className?: string) {
  return cn("font-semibold text-lg", text.primary, className);
}
