import { cn } from "@/lib/utils";
import type { MetricTone } from "./metric";
import { metricValueClassName } from "./metric";

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
  return cn("font-bold tabular-nums", metricValueClassName(foodCostStatusMetricTone(status)), className);
}

export function foodCostProgressIndicatorClassName(isWarning: boolean, className?: string) {
  return cn(
    isWarning ? "bg-[var(--metric-red)]" : "bg-[var(--metric-emerald)]",
    className,
  );
}

export function modifierGroupPanelClassName(className?: string) {
  return cn(
    "rounded-xl border p-5 space-y-4 mb-4 last:mb-0",
    "border-[var(--table-container-border)] bg-[var(--form-line-bg)]",
    className,
  );
}
