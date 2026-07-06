"use client";

import { useMemo } from "react";
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
import { ingredientIsActive } from "@/lib/filters/ingredient-filters";
import { useHubListPagination } from "@/hooks/useHubListPagination";
import { productsCategoryTextClassName } from "@/lib/theme/hub-products";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";
import type { Ingredient } from "@/types/api";

type IngredientsTableProps = {
  ingredients: Ingredient[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
  emptyAction?: React.ReactNode;
};

type IngredientActionsProps = {
  ingredient: Ingredient;
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
};

function IngredientActions({ ingredient, onEdit, onDelete }: IngredientActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <TableActionButton
        icon={Edit}
        label={`Edit ${ingredient.name}`}
        iconOnly
        tone="purple"
        onClick={() => onEdit(ingredient)}
      />
      <TableActionButton
        icon={Trash2}
        label={`Delete ${ingredient.name}`}
        iconOnly
        destructive
        onClick={() => onDelete(ingredient)}
      />
    </div>
  );
}

function IngredientMobileCard({ ingredient, onEdit, onDelete }: IngredientActionsProps) {
  const missingCost = ingredient.costPerUnit == null || ingredient.costPerUnit <= 0;

  return (
    <ListMobileCard>
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn("font-medium", text.primary)}>{ingredient.name}</p>
          <p className={productsCategoryTextClassName()}>{ingredient.unit}</p>
        </div>
        <span className={cn("shrink-0 tabular-nums", missingCost ? text.muted : text.primary)}>
          {!missingCost ? formatCurrency(ingredient.costPerUnit) : "—"}
        </span>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {ingredientIsActive(ingredient) ? (
          <StatusBadge tone="success">Active</StatusBadge>
        ) : (
          <StatusBadge tone="neutral">Off</StatusBadge>
        )}
        {ingredient.primarySupplier?.name ? (
          <Link href="/procurement/suppliers" className={cn("text-sm", text.secondary)}>
            {ingredient.primarySupplier.name}
          </Link>
        ) : null}
      </div>
      <IngredientActions ingredient={ingredient} onEdit={onEdit} onDelete={onDelete} />
    </ListMobileCard>
  );
}

export function IngredientsTable({
  ingredients,
  isLoading,
  hasActiveFilters,
  onEdit,
  onDelete,
  emptyAction,
}: IngredientsTableProps) {
  const emptyDescription = hasActiveFilters
    ? "No ingredients match your filters."
    : "No ingredients yet.";

  const listPagination = useHubListPagination(
    { pageSize: 15 },
    `${ingredients.length}-${hasActiveFilters}`,
  );

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
          title: "Unit",
          dataIndex: "unit",
          key: "unit",
          responsive: ["md"],
          width: 80,
          render: (unit: string) => (
            <span className={productsCategoryTextClassName()}>{unit}</span>
          ),
        },
        {
          title: "Cost",
          dataIndex: "costPerUnit",
          key: "costPerUnit",
          render: (costPerUnit?: number) => {
            const missing = costPerUnit == null || costPerUnit <= 0;
            return (
              <span className={cn("tabular-nums", missing ? text.muted : text.primary)}>
                {!missing ? formatCurrency(costPerUnit) : "—"}
              </span>
            );
          },
        },
        {
          title: "Supplier",
          key: "primarySupplier",
          responsive: ["md"],
          render: (_: unknown, record: Ingredient) =>
            record.primarySupplier?.name ? (
              <Link
                href="/procurement/suppliers"
                className={cn("text-sm hover:opacity-80", text.secondary)}
              >
                {record.primarySupplier.name}
              </Link>
            ) : (
              <span className={text.muted}>—</span>
            ),
        },
        {
          title: "Status",
          key: "isActive",
          width: 96,
          render: (_: unknown, record: Ingredient) =>
            ingredientIsActive(record) ? (
              <StatusBadge tone="success">Active</StatusBadge>
            ) : (
              <StatusBadge tone="neutral">Off</StatusBadge>
            ),
        },
        {
          title: "",
          key: "actions",
          width: 80,
          align: "right" as const,
          render: (_: unknown, record: Ingredient) => (
            <IngredientActions ingredient={record} onEdit={onEdit} onDelete={onDelete} />
          ),
        },
      ] as ColumnsType<Ingredient>,
    [onDelete, onEdit],
  );

  return (
    <ResponsiveDataTableLayout
      mobile={
        isLoading ? (
          <ResponsiveDataTableLayout.Skeleton />
        ) : ingredients.length === 0 ? (
          <ResponsiveDataTableLayout.Empty message={emptyDescription} />
        ) : (
          <PaginatedMobileList
            items={ingredients}
            pageSize={listPagination.pageSize}
            page={listPagination.currentPage}
            onPageChange={listPagination.setCurrentPage}
          >
            {(ingredient) => (
              <IngredientMobileCard
                ingredient={ingredient}
                onEdit={onEdit}
                onDelete={onDelete}
              />
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
          emptyAction={hasActiveFilters ? null : emptyAction}
          columns={columns}
          dataSource={ingredients}
          rowKey="id"
        />
      }
    />
  );
}
