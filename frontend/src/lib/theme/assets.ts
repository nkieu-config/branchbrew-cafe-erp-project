import { cn } from "@/lib/utils";
import { hubIconClassName, hubMetaBadgeClassName, hubSectionPanelClassName } from "./hub-panel";
import { text } from "./surface";

export function assetsSectionPanelClassName(className?: string) {
  return hubSectionPanelClassName("assets", className);
}

export function assetsHubIconClassName(className?: string) {
  return hubIconClassName("assets", className);
}

export function assetsMetaBadgeClassName(className?: string) {
  return hubMetaBadgeClassName("assets", className);
}

export function assetsMutedMetaClassName(className?: string) {
  return cn("text-sm", text.muted, className);
}

export function assetsDialogContentClassName(className?: string) {
  return cn(
    "sm:max-w-lg rounded-xl max-h-[90vh] overflow-y-auto",
    "bg-[var(--table-container-bg)] border-[var(--table-container-border)] text-foreground",
    className,
  );
}

export function equipmentMaintenanceDueRowClassName(className?: string) {
  return cn("bg-[var(--status-warning-bg)]/25", className);
}

export function equipmentMaintenanceOverdueRowClassName(className?: string) {
  return cn("bg-[var(--status-danger-bg)]/25", className);
}

export function equipmentMaintenanceDateClassName(
  overdue: boolean,
  dueSoon: boolean,
  className?: string,
) {
  if (overdue) {
    return cn("tabular-nums text-[var(--status-danger-fg)]", className);
  }
  if (dueSoon) {
    return cn("tabular-nums text-[var(--status-warning-fg)]", className);
  }
  return cn("tabular-nums", text.muted, className);
}
