/**
 * Settings hub page chrome — list panels, hub icons, audit sheets.
 * Not for in-page form blocks; use `settings-form-section.ts` for those.
 */
import { cn } from "@/lib/utils";
import { hubIconClassName, hubSectionPanelClassName } from "./hub-panel";

export function settingsSectionPanelClassName(className?: string) {
  return hubSectionPanelClassName("settings", className);
}

export function settingsHubIconClassName(className?: string) {
  return hubIconClassName("settings", className);
}

export function settingsSheetContentClassName(className?: string) {
  return cn(
    "bg-[var(--table-container-bg)] text-foreground border-[var(--table-container-border)]",
    className,
  );
}
