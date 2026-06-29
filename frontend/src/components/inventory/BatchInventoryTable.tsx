"use client";

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import { Trash2 } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableActionButton } from "@/components/shared/table-action-button";
import { hubListDataTableProps } from "@/lib/theme/data-table";
import { tableCellMutedClassName } from "@/lib/theme/feedback";
import {
  batchExpiryUrgency,
  expiryDateTextClassName,
  expiryUrgencyLabel,
  expiryUrgencyStatusTone,
  stockLevel,
  stockLevelLabel,
  stockLevelStatusTone,
} from "@/lib/theme/stock";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName } from "@/lib/theme/typography";
import { formatDate } from "@/lib/intl-date";
import {
  batchesForIngredient,
  ingredientDisplayName,
  type BatchWithSupplier,
  type InventoryWithIngredient,
} from "@/lib/batch-filters";
import { isExpiredBatch, isExpiringBatch } from "@/lib/inventory-alerts";
import { cn } from "@/lib/utils";

type BatchInventoryTableProps = {
  inventories: InventoryWithIngredient[];
  batches: BatchWithSupplier[];
  loading: boolean;
  hasActiveFilters: boolean;
  onReportWaste: (
    batchId: number,
    ingredientId: number,
    maxQty: number,
    ingredientName: string,
  ) => void;
};

export function BatchInventoryTable({
  inventories,
  batches,
  loading,
  hasActiveFilters,
  onReportWaste,
}: BatchInventoryTableProps) {
  const inventoryColumns = useMemo(
    () => [
      {
        title: "Ingredient Name",
        key: "name",
        sorter: (a: InventoryWithIngredient, b: InventoryWithIngredient) =>
          ingredientDisplayName(a).localeCompare(ingredientDisplayName(b)),
        render: (_: unknown, record: InventoryWithIngredient) => (
          <div className={typeHeadingClassName()}>{ingredientDisplayName(record)}</div>
        ),
      },
      {
        title: "Current Stock",
        key: "stock",
        sorter: (a: InventoryWithIngredient, b: InventoryWithIngredient) => a.stock - b.stock,
        render: (_: unknown, record: InventoryWithIngredient) => (
          <span className="tabular-nums font-mono">
            {Number(record.stock).toFixed(2)} {record.ingredient.unit}
          </span>
        ),
      },
      {
        title: "Min Stock",
        key: "minStock",
        sorter: (a: InventoryWithIngredient, b: InventoryWithIngredient) => a.minStock - b.minStock,
        render: (_: unknown, record: InventoryWithIngredient) => (
          <span className={cn("tabular-nums font-mono", tableCellMutedClassName())}>
            {Number(record.minStock).toFixed(2)}
          </span>
        ),
      },
      {
        title: "Batches",
        key: "batches",
        render: (_: unknown, record: InventoryWithIngredient) => {
          const ingredientBatches = batchesForIngredient(batches, record.ingredient.id);
          const expiringCount = ingredientBatches.filter(
            (batch) => isExpiringBatch(batch) && !isExpiredBatch(batch),
          ).length;
          const expiredCount = ingredientBatches.filter(isExpiredBatch).length;
          return (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={cn("tabular-nums text-sm", text.secondary)}>
                {ingredientBatches.length} batch{ingredientBatches.length === 1 ? "" : "es"}
              </span>
              {expiringCount > 0 ? (
                <StatusBadge tone="warning">{expiringCount} expiring</StatusBadge>
              ) : null}
              {expiredCount > 0 ? (
                <StatusBadge tone="danger">{expiredCount} expired</StatusBadge>
              ) : null}
            </div>
          );
        },
      },
      {
        title: "Status",
        key: "status",
        sorter: (a: InventoryWithIngredient, b: InventoryWithIngredient) => {
          const order = { out: 0, low: 1, ok: 2 };
          return (
            order[stockLevel(a.stock, a.minStock)] - order[stockLevel(b.stock, b.minStock)]
          );
        },
        render: (_: unknown, record: InventoryWithIngredient) => {
          const level = stockLevel(record.stock, record.minStock);
          return (
            <StatusBadge tone={stockLevelStatusTone(level)}>{stockLevelLabel(level)}</StatusBadge>
          );
        },
      },
    ],
    [batches],
  );

  const expandedRowRender = (record: InventoryWithIngredient) => {
    const ingredientId = record.ingredient.id;
    const ingredientBatches = batchesForIngredient(batches, ingredientId);

    const batchColumns: ColumnsType<BatchWithSupplier> = [
      {
        title: "Batch ID",
        dataIndex: "id",
        key: "id",
        responsive: ["md"],
      },
      {
        title: "Supplier",
        key: "supplier",
        responsive: ["lg"],
        render: (_: unknown, b: BatchWithSupplier) => (
          <span>{b.purchaseOrder?.supplier?.name || "—"}</span>
        ),
      },
      {
        title: "Qty",
        key: "quantity",
        render: (_: unknown, b: BatchWithSupplier) => (
          <span className="tabular-nums font-mono font-medium">
            {Number(b.quantity).toFixed(2)} {record.ingredient.unit}
          </span>
        ),
      },
      {
        title: "Expiry",
        key: "expiryDate",
        render: (_: unknown, b: BatchWithSupplier) => {
          if (!b.expiryDate) return <span className={`text-xs ${text.muted}`}>No expiry</span>;
          const urgency = batchExpiryUrgency(b.expiryDate);
          const showBadge = urgency && urgency !== "safe";
          return (
            <div className="flex flex-wrap items-center gap-2">
              <span className={expiryDateTextClassName(urgency)}>{formatDate(b.expiryDate)}</span>
              {showBadge && urgency ? (
                <StatusBadge tone={expiryUrgencyStatusTone(urgency)}>
                  {expiryUrgencyLabel(urgency)}
                </StatusBadge>
              ) : null}
            </div>
          );
        },
      },
      {
        title: "Action",
        key: "action",
        render: (_: unknown, b: BatchWithSupplier) => (
          <TableActionButton
            icon={Trash2}
            label="Report waste"
            iconOnly
            destructive
            onClick={() =>
              onReportWaste(
                b.id,
                b.ingredientId,
                b.quantity,
                ingredientDisplayName(record),
              )
            }
          />
        ),
      },
    ];

    return (
      <DataTable
        columns={batchColumns}
        dataSource={ingredientBatches}
        rowKey="id"
        pagination={false}
        size="small"
        hideBorders
        scroll={{ x: undefined }}
        emptyDescription="No active batches for this ingredient."
      />
    );
  };

  return (
    <DataTable
      {...hubListDataTableProps({ pageSize: 10 })}
      loading={loading}
      emptyDescription={
        hasActiveFilters
          ? "No ingredients match your filters."
          : "No inventory records for this branch yet."
      }
      scroll={{ x: undefined }}
      columns={inventoryColumns}
      dataSource={inventories}
      rowKey="id"
      expandable={{ expandedRowRender }}
    />
  );
}
