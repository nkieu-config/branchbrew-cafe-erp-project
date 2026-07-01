import { cn } from "@/lib/utils";
import { hubMetaBadgeClassName, hubSectionPanelClassName } from "./hub-panel";

export function crmSectionPanelClassName(className?: string) {
  return hubSectionPanelClassName("crm", className);
}

export function productsSectionPanelClassName(className?: string) {
  return hubSectionPanelClassName("products", className);
}

export function productsCategoryBadgeClassName(className?: string) {
  return hubMetaBadgeClassName("products", className);
}

export function productsDialogContentClassName(className?: string) {
  return cn(
    "sm:max-w-lg rounded-xl max-h-[90vh] overflow-y-auto",
    "bg-[var(--table-container-bg)] border-[var(--table-container-border)] text-foreground",
    className,
  );
}

export function procurementSectionPanelClassName(className?: string) {
  return hubSectionPanelClassName("procurement", className);
}

export function procurementMetaBadgeClassName(className?: string) {
  return hubMetaBadgeClassName("procurement", className);
}

export function procurementDialogContentClassName(className?: string) {
  return cn(
    "sm:max-w-lg rounded-xl max-h-[90vh] overflow-y-auto",
    "bg-[var(--table-container-bg)] border-[var(--table-container-border)] text-foreground",
    className,
  );
}

export function kitchenSectionPanelClassName(className?: string) {
  return hubSectionPanelClassName("kitchen", className);
}

export function kitchenMetaBadgeClassName(className?: string) {
  return hubMetaBadgeClassName("kitchen", className);
}

export function kitchenDialogContentClassName(className?: string) {
  return cn(
    "sm:max-w-lg rounded-xl max-h-[90vh] overflow-y-auto",
    "bg-[var(--table-container-bg)] border-[var(--table-container-border)] text-foreground",
    className,
  );
}

export function hrSectionPanelClassName(className?: string) {
  return hubSectionPanelClassName("hr", className);
}

export function posSectionPanelClassName(className?: string) {
  return hubSectionPanelClassName("pos", className);
}

export function hrMetaBadgeClassName(className?: string) {
  return hubMetaBadgeClassName("hr", className);
}

export function hrDialogContentClassName(className?: string) {
  return cn(
    "sm:max-w-lg rounded-xl max-h-[90vh] overflow-y-auto",
    "bg-[var(--table-container-bg)] border-[var(--table-container-border)] text-foreground",
    className,
  );
}
