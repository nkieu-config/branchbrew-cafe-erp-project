import { cn } from "@/lib/utils";
import { hubIconClassName, hubSectionPanelClassName } from "./hub-panel";
import { text } from "./surface";

export function organizationSectionPanelClassName(className?: string) {
  return hubSectionPanelClassName("organization", className);
}

export function organizationHubIconClassName(className?: string) {
  return hubIconClassName("organization", className);
}

export function organizationDialogContentClassName(className?: string) {
  return cn(
    "sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto",
    "bg-[var(--table-container-bg)] border-[var(--table-container-border)] text-foreground",
    className,
  );
}

export function branchCardAccentClassName(isCentralKitchen?: boolean, className?: string) {
  return cn(
    isCentralKitchen
      ? "ring-1 ring-[var(--tone-organization-border)]"
      : undefined,
    className,
  );
}

export function branchCardMetaClassName(className?: string) {
  return cn("text-sm tabular-nums", text.muted, className);
}

export function organizationDialogWideClassName(className?: string) {
  return cn(organizationDialogContentClassName("sm:max-w-xl"), className);
}
