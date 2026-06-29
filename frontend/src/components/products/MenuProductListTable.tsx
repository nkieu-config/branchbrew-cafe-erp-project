"use client";

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableActionButton } from "@/components/shared/table-action-button";
import { formatDate } from "@/lib/intl-date";
import { formatBaht } from "@/lib/money";
import { calcProductFoodCost, foodCostStatus } from "@/lib/food-cost";
import { productFoodCostBucket } from "@/lib/food-cost-filters";
import { productHasRecipe, productIsActive } from "@/lib/menu-product-filters";
import { buildProductsCostingUrl } from "@/lib/products-hub-url";
import { hubListDataTableProps } from "@/lib/theme/data-table";
import { tableCellMutedClassName } from "@/lib/theme/feedback";
import { inlineLinkClassName } from "@/lib/theme/hub-primitives";
import { foodCostStatusClassName, productsCategoryBadgeClassName } from "@/lib/theme/hub-products";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName, typeUiLabelClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/api";

type MenuProductListTableProps = {
  products: Product[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export function MenuProductListTable({
  products,
  isLoading,
  hasActiveFilters,
  onEdit,
  onDelete,
}: MenuProductListTableProps) {
  const columns = useMemo(
    () =>
      [
        {
          title: "ID",
          dataIndex: "id",
          key: "id",
          responsive: ["lg"],
          render: (id: number) => (
            <span className={tableCellMutedClassName()}>#{id}</span>
          ),
        },
        {
          title: "Menu Name",
          dataIndex: "name",
          key: "name",
          render: (name: string) => (
            <span className={typeHeadingClassName()}>{name}</span>
          ),
        },
        {
          title: "Category",
          dataIndex: "category",
          key: "category",
          responsive: ["md"],
          render: (category: string) => (
            <span className={productsCategoryBadgeClassName()}>{category}</span>
          ),
        },
        {
          title: "Price (฿)",
          dataIndex: "price",
          key: "price",
          render: (price: number) => (
            <span className={typeUiLabelClassName(cn("tabular-nums", text.primary))}>
              {formatBaht(price)}
            </span>
          ),
        },
        {
          title: "Food Cost %",
          key: "foodCost",
          responsive: ["md"],
          render: (_: unknown, record: Product) => {
            const bucket = productFoodCostBucket(record);
            if (bucket === "no-recipe") {
              return (
                <Link
                  href={buildProductsCostingUrl({ status: "no-recipe" })}
                  className={inlineLinkClassName()}
                >
                  No recipe
                </Link>
              );
            }
            if (bucket === "no-price") {
              return <span className={text.muted}>No price</span>;
            }
            const { cost, foodCostPercent } = calcProductFoodCost(record);
            const status = foodCostStatus(foodCostPercent);
            return (
              <div>
                <Link
                  href={buildProductsCostingUrl({
                    status,
                    ...(record.category ? { category: record.category } : {}),
                  })}
                  className={cn(foodCostStatusClassName(status), "hover:opacity-80")}
                >
                  {foodCostPercent.toFixed(1)}%
                </Link>
                <div className={cn("text-xs", tableCellMutedClassName())}>
                  COGS {formatBaht(cost)}
                </div>
              </div>
            );
          },
        },
        {
          title: "Status",
          key: "isActive",
          render: (_: unknown, record: Product) =>
            productIsActive(record) ? (
              <StatusBadge tone="success">Active</StatusBadge>
            ) : (
              <StatusBadge tone="neutral">Inactive</StatusBadge>
            ),
        },
        {
          title: "Menu Recipe",
          key: "recipe",
          responsive: ["lg"],
          render: (_: unknown, record: Product) =>
            productHasRecipe(record) ? (
              <StatusBadge tone="info">
                {record.recipeItems!.length} ingredients
              </StatusBadge>
            ) : (
              <StatusBadge tone="neutral">No Menu Recipe</StatusBadge>
            ),
        },
        {
          title: "Created",
          dataIndex: "createdAt",
          key: "createdAt",
          responsive: ["lg"],
          render: (createdAt?: string) => (
            <span className={cn("text-sm font-medium", text.muted)}>
              {createdAt ? formatDate(createdAt) : "—"}
            </span>
          ),
        },
        {
          title: "",
          key: "actions",
          width: 96,
          align: "right" as const,
          render: (_: unknown, record: Product) => (
            <div className="flex items-center justify-end gap-1">
              <TableActionButton
                icon={Edit}
                label={`Edit ${record.name}`}
                iconOnly
                tone="purple"
                onClick={() => onEdit(record)}
              />
              <TableActionButton
                icon={Trash2}
                label={`Delete ${record.name}`}
                iconOnly
                destructive
                onClick={() => onDelete(record)}
              />
            </div>
          ),
        },
      ] as ColumnsType<Product>,
    [onEdit, onDelete],
  );

  return (
    <DataTable
      {...hubListDataTableProps()}
      loading={isLoading}
      emptyDescription={
        hasActiveFilters
          ? "No menu items match your filters."
          : "No menu items yet. Add raw ingredients first, then create menu items for the POS."
      }
      columns={columns}
      dataSource={products}
      rowKey="id"
    />
  );
}
