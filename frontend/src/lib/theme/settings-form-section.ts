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
