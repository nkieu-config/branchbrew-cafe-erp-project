"use client";

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { Edit, AlertTriangle } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableActionButton } from "@/components/shared/table-action-button";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
  ProgressValue,
} from "@/components/ui/progress";
import { formatCurrency } from "@/lib/money";
import { calcProductFoodCost, foodCostStatus } from "@/lib/food-cost";
import {
  TARGET_FOOD_COST_PERCENT,
  foodCostStatusLabel,
  foodCostStatusTone,
  productFoodCostBucket,
  productHasMissingIngredientCost,
} from "@/lib/food-cost-filters";
import { productHasRecipe } from "@/lib/menu-product-filters";
import { hubListDataTableProps } from "@/lib/theme/data-table";
import { tableCellMutedClassName } from "@/lib/theme/feedback";
import { inlineLinkClassName } from "@/lib/theme/hub-primitives";
import {
  foodCostProgressIndicatorClassName,
  foodCostStatusClassName,
  productsCategoryBadgeClassName,
} from "@/lib/theme/hub-products";
import { metricValueClassName } from "@/lib/theme/metric";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName, typeUiLabelClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/api";

type FoodCostTableProps = {
  products: Product[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  onEdit: (product: Product) => void;
};

export function FoodCostTable({
  products,
  isLoading,
  hasActiveFilters,
  onEdit,
}: FoodCostTableProps) {
  const columns = useMemo(
    () =>
      [
        {
          title: "Menu Item",
          dataIndex: "name",
          key: "name",
          render: (name: string, record: Product) => (
            <div>
              <span className={typeHeadingClassName()}>{name}</span>
              {productHasMissingIngredientCost(record) && (
                <div
                  className={cn(
                    "mt-1 inline-flex items-center gap-1 text-xs font-medium",
                    metricValueClassName("amber"),
                  )}
                >
                  <AlertTriangle className="w-3 h-3" aria-hidden />
                  Missing ingredient cost
                </div>
              )}
            </div>
          ),
        },
        {
          title: "Category",
          dataIndex: "category",
          key: "category",
          responsive: ["md"],
          render: (category: string) =>
            category ? (
              <span className={productsCategoryBadgeClassName()}>{category}</span>
            ) : (
              <span className={text.muted}>—</span>
            ),
        },
        {
          title: "Sale Price",
          dataIndex: "price",
          key: "price",
          align: "right" as const,
          render: (price: number) => (
            <span className={typeHeadingClassName("tabular-nums")}>
              {formatCurrency(price)}
            </span>
          ),
        },
        {
          title: "Recipe Cost",
          key: "recipeCost",
          align: "right" as const,
          responsive: ["md"],
          render: (_: unknown, record: Product) => {
            if (!productHasRecipe(record)) {
              return <span className={text.muted}>—</span>;
            }
            const { cost } = calcProductFoodCost(record);
            return (
              <span className={typeHeadingClassName(cn("tabular-nums", metricValueClassName("red")))}>
                {formatCurrency(cost)}
              </span>
            );
          },
        },
        {
          title: `Food Cost % (target ≤ ${TARGET_FOOD_COST_PERCENT}%)`,
          key: "foodCostPercent",
          render: (_: unknown, record: Product) => {
            const bucket = productFoodCostBucket(record);
            if (bucket === "no-recipe") {
              return (
                <Link href="/products" className={inlineLinkClassName()}>
                  Add recipe
                </Link>
              );
            }
            if (bucket === "no-price") {
              return <span className={text.muted}>Set sale price</span>;
            }

            const { foodCostPercent } = calcProductFoodCost(record);
            const status = foodCostStatus(foodCostPercent);
            const isWarning = status !== "good";
            const percent = parseFloat(foodCostPercent.toFixed(1));

            return (
              <div className="flex flex-wrap items-center gap-3 min-w-[8rem]">
                <Progress value={Math.min(percent, 100)} className="w-28 gap-1">
                  <ProgressTrack className="h-2">
                    <ProgressIndicator
                      className={foodCostProgressIndicatorClassName(isWarning)}
                    />
                  </ProgressTrack>
                  <ProgressValue
                    className={typeHeadingClassName(
                      cn("text-xs tabular-nums", foodCostStatusClassName(status)),
                    )}
                  />
                </Progress>
                {status === "bad" && (
                  <StatusBadge tone="danger" className={typeUiLabelClassName("gap-1")}>
                    <AlertTriangle className="w-3 h-3" aria-hidden />
                    High
                  </StatusBadge>
                )}
              </div>
            );
          },
        },
        {
          title: "Status",
          key: "status",
          responsive: ["lg"],
          render: (_: unknown, record: Product) => {
            const bucket = productFoodCostBucket(record);
            return (
              <StatusBadge tone={foodCostStatusTone(bucket)}>
                {foodCostStatusLabel(bucket)}
              </StatusBadge>
            );
          },
        },
        {
          title: "Recipe",
          key: "recipe",
          responsive: ["lg"],
          render: (_: unknown, record: Product) =>
            productHasRecipe(record) ? (
              <span className={tableCellMutedClassName()}>
                {record.recipeItems!.length} ingredient
                {record.recipeItems!.length === 1 ? "" : "s"}
              </span>
            ) : (
              <span className={text.muted}>—</span>
            ),
        },
        {
          title: "",
          key: "actions",
          width: 72,
          align: "right" as const,
          render: (_: unknown, record: Product) => (
            <TableActionButton
              icon={Edit}
              label={`Edit recipe for ${record.name}`}
              iconOnly
              tone="purple"
              onClick={() => onEdit(record)}
            />
          ),
        },
      ] as ColumnsType<Product>,
    [onEdit],
  );

  return (
    <DataTable
      {...hubListDataTableProps()}
      loading={isLoading}
      columns={columns}
      dataSource={products}
      rowKey="id"
      emptyDescription={
        hasActiveFilters
          ? "No menu items match your food cost filters."
          : "No menu items yet. Add recipes on Menu Items to track food cost."
      }
    />
  );
}
