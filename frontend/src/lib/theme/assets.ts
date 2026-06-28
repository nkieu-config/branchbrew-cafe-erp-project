import { cn } from "@/lib/utils";
import { hubIconClassName, hubMetaBadgeClassName, hubSectionPanelClassName } from "./hub-panel";
import { metricValueClassName } from "./metric";
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

export function assetsDialogContentClassName(className?: string) {
  return cn(
    "sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto",
    "bg-[var(--table-container-bg)] border-[var(--table-container-border)] text-foreground",
    className,
  );
}

export function equipmentMaintenanceDueRowClassName(className?: string) {
  return cn("bg-[var(--status-warning-bg)]/45", className);
}

export function equipmentMaintenanceOverdueRowClassName(className?: string) {
  return cn("bg-[var(--status-danger-bg)]/45", className);
}

export function equipmentMaintenanceDateClassName(
  overdue: boolean,
  dueSoon: boolean,
  className?: string,
) {
  if (overdue) {
    return cn("font-medium tabular-nums", metricValueClassName("red"), className);
  }
  if (dueSoon) {
    return cn("font-medium tabular-nums", metricValueClassName("amber"), className);
  }
  return cn("tabular-nums", text.muted, className);
}
