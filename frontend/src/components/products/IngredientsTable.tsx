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
import { ingredientIsActive } from "@/lib/ingredient-filters";
import { hubListDataTableProps } from "@/lib/theme/data-table";
import { tableCellMutedClassName } from "@/lib/theme/feedback";
import { productsCategoryBadgeClassName } from "@/lib/theme/hub-products";
import { metricValueClassName } from "@/lib/theme/metric";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName, typeUiLabelClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";
import type { Ingredient } from "@/types/api";

type IngredientsTableProps = {
  ingredients: Ingredient[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
};

export function IngredientsTable({
  ingredients,
  isLoading,
  hasActiveFilters,
  onEdit,
  onDelete,
}: IngredientsTableProps) {
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
          title: "Ingredient Name",
          dataIndex: "name",
          key: "name",
          render: (name: string) => (
            <span className={typeHeadingClassName()}>{name}</span>
          ),
        },
        {
          title: "Unit",
          dataIndex: "unit",
          key: "unit",
          responsive: ["md"],
          render: (unit: string) => (
            <span className={productsCategoryBadgeClassName()}>{unit}</span>
          ),
        },
        {
          title: "Cost / Unit (฿)",
          dataIndex: "costPerUnit",
          key: "costPerUnit",
          render: (costPerUnit?: number) => {
            const missing = costPerUnit == null || costPerUnit <= 0;
            return (
              <span
                className={typeUiLabelClassName(
                  cn("tabular-nums", missing ? metricValueClassName("amber") : text.primary),
                )}
              >
                {!missing ? formatBaht(costPerUnit) : "—"}
              </span>
            );
          },
        },
        {
          title: "Primary Supplier",
          key: "primarySupplier",
          responsive: ["md"],
          render: (_: unknown, record: Ingredient) =>
            record.primarySupplier?.name ? (
              <Link
                href="/procurement/suppliers"
                className={cn("text-sm font-medium hover:opacity-80", text.secondary)}
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
          render: (_: unknown, record: Ingredient) =>
            ingredientIsActive(record) ? (
              <StatusBadge tone="success">Active</StatusBadge>
            ) : (
              <StatusBadge tone="neutral">Inactive</StatusBadge>
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
          render: (_: unknown, record: Ingredient) => (
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
      ] as ColumnsType<Ingredient>,
    [onEdit, onDelete],
  );

  return (
    <DataTable
      {...hubListDataTableProps()}
      loading={isLoading}
      emptyDescription={
        hasActiveFilters
          ? "No ingredients match your filters."
          : "No ingredients yet. Add raw materials to build menu recipes and production BOMs."
      }
      columns={columns}
      dataSource={ingredients}
      rowKey="id"
    />
  );
}
