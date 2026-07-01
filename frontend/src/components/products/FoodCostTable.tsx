"use client";

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { Edit } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import {
  ListMobileCard,
  PaginatedMobileList,
  ResponsiveDataTableLayout,
} from "@/components/shared/responsive-data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableActionButton } from "@/components/shared/table-action-button";
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
import { useHubListPagination } from "@/hooks/useHubListPagination";
import { inlineLinkClassName } from "@/lib/theme/hub-primitives";
import {
  foodCostStatusClassName,
  productsCategoryTextClassName,
} from "@/lib/theme/hub-products";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/api";

type FoodCostTableProps = {
  products: Product[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  onEdit: (product: Product) => void;
};

function foodCostMobileLabel(record: Product) {
  const bucket = productFoodCostBucket(record);
  if (bucket === "no-recipe") {
    return (
      <Link href="/products" className={inlineLinkClassName("text-sm")}>
        Add recipe
      </Link>
    );
  }
  if (bucket === "no-price") {
    return <span className={text.muted}>—</span>;
  }
  const { foodCostPercent } = calcProductFoodCost(record);
  const status = foodCostStatus(foodCostPercent);
  return <span className={foodCostStatusClassName(status)}>{foodCostPercent.toFixed(1)}%</span>;
}

export function FoodCostTable({
  products,
  isLoading,
  hasActiveFilters,
  onEdit,
}: FoodCostTableProps) {
  const emptyDescription = hasActiveFilters
    ? "No items match your filters."
    : "No menu items yet.";

  const listPagination = useHubListPagination(
    { pageSize: 15 },
    `${products.length}-${hasActiveFilters}`,
  );

  const columns = useMemo(
    () =>
      [
        {
          title: "Item",
          dataIndex: "name",
          key: "name",
          render: (name: string, record: Product) => (
            <div>
              <span className={cn("font-medium", text.primary)}>{name}</span>
              {productHasMissingIngredientCost(record) && (
                <p className={cn("mt-0.5 text-xs", text.muted)}>Missing ingredient cost</p>
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
              <span className={productsCategoryTextClassName()}>{category}</span>
            ) : (
              <span className={text.muted}>—</span>
            ),
        },
        {
          title: "Price",
          dataIndex: "price",
          key: "price",
          align: "right" as const,
          render: (price: number) => (
            <span className={cn("tabular-nums font-medium", text.primary)}>
              {formatCurrency(price)}
            </span>
          ),
        },
        {
          title: "COGS",
          key: "recipeCost",
          align: "right" as const,
          responsive: ["md"],
          render: (_: unknown, record: Product) => {
            if (!productHasRecipe(record)) {
              return <span className={text.muted}>—</span>;
            }
            const { cost } = calcProductFoodCost(record);
            return (
              <span className={cn("tabular-nums", text.secondary)}>
                {formatCurrency(cost)}
              </span>
            );
          },
        },
        {
          title: `Cost % (≤${TARGET_FOOD_COST_PERCENT}%)`,
          key: "foodCostPercent",
          render: (_: unknown, record: Product) => foodCostMobileLabel(record),
        },
        {
          title: "Status",
          key: "status",
          responsive: ["lg"],
          width: 120,
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
          title: "",
          key: "actions",
          width: 48,
          align: "right" as const,
          render: (_: unknown, record: Product) => (
            <TableActionButton
              icon={Edit}
              label={`Edit ${record.name}`}
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
    <ResponsiveDataTableLayout
      mobile={
        isLoading ? (
          <ResponsiveDataTableLayout.Skeleton />
        ) : products.length === 0 ? (
          <ResponsiveDataTableLayout.Empty message={emptyDescription} />
        ) : (
          <PaginatedMobileList
            items={products}
            pageSize={listPagination.pageSize}
            page={listPagination.currentPage}
            onPageChange={listPagination.setCurrentPage}
          >
            {(record) => {
              const bucket = productFoodCostBucket(record);
              const cogs = productHasRecipe(record) ? calcProductFoodCost(record).cost : null;

              return (
                <ListMobileCard>
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={cn("font-medium", text.primary)}>{record.name}</p>
                      {record.category ? <p className={productsCategoryTextClassName()}>{record.category}</p> : null}
                      {productHasMissingIngredientCost(record) ? (
                        <p className={cn("mt-0.5 text-xs", text.muted)}>Missing ingredient cost</p>
                      ) : null}
                    </div>
                    <span className={cn("shrink-0 tabular-nums font-medium", text.primary)}>
                      {formatCurrency(record.price)}
                    </span>
                  </div>
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
                    {foodCostMobileLabel(record)}
                    {cogs != null ? (
                      <span className={cn("tabular-nums", text.secondary)}>
                        COGS {formatCurrency(cogs)}
                      </span>
                    ) : null}
                    <StatusBadge tone={foodCostStatusTone(bucket)} className="shrink-0">
                      {foodCostStatusLabel(bucket)}
                    </StatusBadge>
                  </div>
                  <div className="flex justify-end">
                    <TableActionButton
                      icon={Edit}
                      label={`Edit ${record.name}`}
                      iconOnly
                      tone="purple"
                      onClick={() => onEdit(record)}
                    />
                  </div>
                </ListMobileCard>
              );
            }}
          </PaginatedMobileList>
        )
      }
      desktop={
        <DataTable
          hideBorders
          pagination={listPagination.tablePagination}
          loading={isLoading}
          columns={columns}
          dataSource={products}
          rowKey="id"
          emptyDescription={emptyDescription}
        />
      }
    />
  );
}
