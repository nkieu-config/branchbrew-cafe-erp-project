import { cn } from "@/lib/utils";
import type { MetricTone } from "./metric";
import { metricValueClassName } from "./metric";
import { text } from "./surface";

export {
  productsCategoryBadgeClassName,
  productsDialogContentClassName,
  productsSectionPanelClassName,
} from "./hub-section-aliases";

export function foodCostStatusMetricTone(status: "good" | "warn" | "bad"): MetricTone {
  switch (status) {
    case "good":
      return "emerald";
    case "warn":
      return "amber";
    default:
      return "red";
  }
}

export function foodCostStatusClassName(status: "good" | "warn" | "bad", className?: string) {
  return cn("font-semibold tabular-nums text-sm", metricValueClassName(foodCostStatusMetricTone(status)), className);
}

export function foodCostProgressIndicatorClassName(isWarning: boolean, className?: string) {
  return cn(
    isWarning ? "bg-[var(--metric-red)]" : "bg-[var(--metric-emerald)]",
    className,
  );
}

export function modifierGroupPanelClassName(className?: string) {
  return cn("space-y-3 py-4 border-b border-[var(--table-row-border)] last:border-0", className);
}

export function productsCategoryTextClassName(className?: string) {
  return cn("text-sm", text.muted, className);
}
