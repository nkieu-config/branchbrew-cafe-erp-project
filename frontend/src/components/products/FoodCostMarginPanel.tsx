"use client";

import Link from "next/link";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { formatBaht } from "@/lib/money";
import { compareFoodCostMargins } from "@/lib/food-cost-margin";
import { formSectionClassName, inlineLinkClassName } from "@/lib/theme/hub-primitives";
import { foodCostStatusClassName } from "@/lib/theme/hub-products";
import { metricValueClassName } from "@/lib/theme/metric";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName, typeSectionLabelClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/api";
import { foodCostStatus } from "@/lib/food-cost";

type FoodCostMarginPanelProps = {
  orders: Order[];
  theoreticalAvgPercent: number;
  ordersLoading?: boolean;
};

export function FoodCostMarginPanel({
  orders,
  theoreticalAvgPercent,
  ordersLoading = false,
}: FoodCostMarginPanelProps) {
  if (ordersLoading || orders.length === 0 || theoreticalAvgPercent <= 0) {
    return null;
  }

  const margin = compareFoodCostMargins(orders, theoreticalAvgPercent);
  const actualStatus = foodCostStatus(margin.actualFoodCostPercent);
  const theoreticalStatus = foodCostStatus(theoreticalAvgPercent);
  const varianceUp = margin.variancePercent > 0;

  return (
    <section className={formSectionClassName()} aria-label="Actual vs theoretical food cost">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className={typeSectionLabelClassName(cn("text-sm", text.secondary))}>
            Actual vs recipe food cost
          </h3>
          <p className={cn("text-sm mt-1", text.muted)}>
            Compares completed-order COGS ({margin.orderCount} orders) to menu recipe averages.
          </p>
        </div>
        <Link href="/pos/orders" className={inlineLinkClassName("inline-flex items-center gap-1 text-sm")}>
          View orders
          <ArrowRight className="w-3.5 h-3.5" aria-hidden />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className={cn("text-xs font-medium", text.muted)}>Recipe average (theoretical)</p>
          <p className={typeHeadingClassName(cn("text-2xl tabular-nums mt-1", foodCostStatusClassName(theoreticalStatus)))}>
            {theoreticalAvgPercent.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className={cn("text-xs font-medium", text.muted)}>Actual from orders</p>
          <p className={typeHeadingClassName(cn("text-2xl tabular-nums mt-1", foodCostStatusClassName(actualStatus)))}>
            {margin.actualFoodCostPercent.toFixed(1)}%
          </p>
          <p className={cn("text-xs mt-1 tabular-nums", text.muted)}>
            COGS {formatBaht(margin.totalCogs)} / {formatBaht(margin.totalRevenue)}
          </p>
        </div>
        <div>
          <p className={cn("text-xs font-medium", text.muted)}>Variance</p>
          <p
            className={typeHeadingClassName(
              cn(
                "text-2xl tabular-nums mt-1 inline-flex items-center gap-1.5",
                varianceUp ? metricValueClassName("red") : metricValueClassName("emerald"),
              ),
            )}
          >
            {varianceUp ? (
              <TrendingUp className="w-5 h-5" aria-hidden />
            ) : (
              <TrendingDown className="w-5 h-5" aria-hidden />
            )}
            {margin.variancePercent > 0 ? "+" : ""}
            {margin.variancePercent.toFixed(1)}%
          </p>
          <p className={cn("text-xs mt-1", text.muted)}>
            Gross margin {margin.grossMarginPercent.toFixed(1)}%
          </p>
        </div>
      </div>
    </section>
  );
}
