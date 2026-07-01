"use client";

import { memo, useMemo, type ReactNode } from "react";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
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
import { productFoodCostBucket } from "@/lib/food-cost-filters";
import { productHasRecipe, productIsActive } from "@/lib/menu-product-filters";
import { buildProductsCostingUrl } from "@/lib/products-hub-url";
import { useHubListPagination } from "@/hooks/useHubListPagination";
import { inlineLinkClassName } from "@/lib/theme/hub-primitives";
import {
  foodCostStatusClassName,
  productsCategoryTextClassName,
} from "@/lib/theme/hub-products";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/api";

type MenuProductListTableProps = {
  products: Product[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

type MenuProductMobileCardProps = {
  record: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

const MenuProductMobileCard = memo(function MenuProductMobileCard({
  record,
  onEdit,
  onDelete,
}: MenuProductMobileCardProps) {
  const bucket = productFoodCostBucket(record);
  let foodCostLabel = null as ReactNode;
  if (bucket === "no-recipe") {
    foodCostLabel = (
      <Link href={buildProductsCostingUrl({ status: "no-recipe" })} className={inlineLinkClassName("text-sm")}>
        No recipe
      </Link>
    );
  } else if (bucket !== "no-price") {
    const { foodCostPercent } = calcProductFoodCost(record);
    const status = foodCostStatus(foodCostPercent);
    foodCostLabel = (
      <Link
        href={buildProductsCostingUrl({
          status,
          ...(record.category ? { category: record.category } : {}),
        })}
        className={foodCostStatusClassName(status)}
      >
        {foodCostPercent.toFixed(1)}% food cost
      </Link>
    );
  }

  return (
    <ListMobileCard>
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn("font-medium", text.primary)}>{record.name}</p>
          {record.category ? <p className={productsCategoryTextClassName()}>{record.category}</p> : null}
        </div>
        <span className={cn("shrink-0 tabular-nums font-medium", text.primary)}>
          {formatCurrency(record.price)}
        </span>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {productIsActive(record) ? (
          <StatusBadge tone="success">Active</StatusBadge>
        ) : (
          <StatusBadge tone="neutral">Off</StatusBadge>
        )}
        {foodCostLabel}
        {productHasRecipe(record) ? (
          <span className={cn("text-xs tabular-nums", text.muted)}>
            {record.recipeItems!.length} recipe items
          </span>
        ) : null}
      </div>
      <div className="flex justify-end gap-1">
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
    </ListMobileCard>
  );
});

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
          title: "Name",
          dataIndex: "name",
          key: "name",
          render: (name: string) => (
            <span className={cn("font-medium", text.primary)}>{name}</span>
          ),
        },
        {
          title: "Category",
          dataIndex: "category",
          key: "category",
          responsive: ["md"],
          render: (category: string) => (
            <span className={productsCategoryTextClassName()}>{category}</span>
          ),
        },
        {
          title: "Price",
          dataIndex: "price",
          key: "price",
          render: (price: number) => (
            <span className={cn("tabular-nums font-medium", text.primary)}>
              {formatCurrency(price)}
            </span>
          ),
        },
        {
          title: "Food cost",
          key: "foodCost",
          responsive: ["md"],
          render: (_: unknown, record: Product) => {
            const bucket = productFoodCostBucket(record);
            if (bucket === "no-recipe") {
              return (
                <Link
                  href={buildProductsCostingUrl({ status: "no-recipe" })}
                  className={inlineLinkClassName("text-sm")}
                >
                  No recipe
                </Link>
              );
            }
            if (bucket === "no-price") {
              return <span className={text.muted}>—</span>;
            }
            const { foodCostPercent } = calcProductFoodCost(record);
            const status = foodCostStatus(foodCostPercent);
            return (
              <Link
                href={buildProductsCostingUrl({
                  status,
                  ...(record.category ? { category: record.category } : {}),
                })}
                className={foodCostStatusClassName(status)}
              >
                {foodCostPercent.toFixed(1)}%
              </Link>
            );
          },
        },
        {
          title: "Status",
          key: "isActive",
          width: 96,
          render: (_: unknown, record: Product) =>
            productIsActive(record) ? (
              <StatusBadge tone="success">Active</StatusBadge>
            ) : (
              <StatusBadge tone="neutral">Off</StatusBadge>
            ),
        },
        {
          title: "Recipe",
          key: "recipe",
          responsive: ["lg"],
          render: (_: unknown, record: Product) =>
            productHasRecipe(record) ? (
              <span className={cn("text-sm tabular-nums", text.muted)}>
                {record.recipeItems!.length} items
              </span>
            ) : (
              <span className={text.muted}>—</span>
            ),
        },
        {
          title: "",
          key: "actions",
          width: 80,
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

  const emptyDescription = hasActiveFilters ? "No items match your filters." : "No menu items yet.";

  const listPagination = useHubListPagination(
    { pageSize: 15 },
    `${products.length}-${hasActiveFilters}`,
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
            {(record) => (
              <MenuProductMobileCard record={record} onEdit={onEdit} onDelete={onDelete} />
            )}
          </PaginatedMobileList>
        )
      }
      desktop={
        <DataTable
          hideBorders
          pagination={listPagination.tablePagination}
          loading={isLoading}
          emptyDescription={emptyDescription}
          columns={columns}
          dataSource={products}
          rowKey="id"
        />
      }
    />
  );
}
