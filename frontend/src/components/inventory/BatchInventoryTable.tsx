"use client";

import { useCallback, useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import { Trash2 } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import {
  ListMobileCard,
  PaginatedMobileList,
  ResponsiveDataTableLayout,
} from "@/components/shared/responsive-data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableActionButton } from "@/components/shared/table-action-button";
import { useHubListPagination } from "@/hooks/useHubListPagination";
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
import { formatDate } from "@/lib/intl-date";
import { formatQuantity } from "@/lib/money";
import {
  buildIngredientBatchIndex,
  getIngredientBatchIndexEntry,
  ingredientDisplayName,
  type BatchWithSupplier,
  type IngredientBatchIndexEntry,
  type InventoryWithIngredient,
} from "@/lib/filters/batch-filters";
import { cn } from "@/lib/utils";

function batchStatusRank(
  record: InventoryWithIngredient,
  index: Map<number, IngredientBatchIndexEntry>,
): number {
  const entry = getIngredientBatchIndexEntry(index, record.ingredient.id);
  if (entry.expiredCount > 0) return 0;
  if (entry.expiringCount > 0) return 1;
  const order = { out: 2, low: 3, ok: 4 };
  return order[stockLevel(record.stock, record.minStock)];
}

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

function BatchMobileRows({
  record,
  batchEntry,
  onReportWaste,
}: {
  record: InventoryWithIngredient;
  batchEntry: IngredientBatchIndexEntry;
  onReportWaste: BatchInventoryTableProps["onReportWaste"];
}) {
  if (batchEntry.batches.length === 0) {
    return <p className={cn("text-xs", text.muted)}>No batches for this ingredient.</p>;
  }

  return (
    <ul className="mt-3 space-y-2 border-t border-[var(--table-row-border)] pt-3">
      {batchEntry.batches.map((batch) => {
        const urgency = batch.expiryDate ? batchExpiryUrgency(batch.expiryDate) : null;
        const showBadge = urgency && urgency !== "safe";
        return (
          <li
            key={batch.id}
            className="flex items-start justify-between gap-2 text-sm"
          >
            <div className="min-w-0">
              <p className={cn("tabular-nums", text.primary)}>
                {formatQuantity(batch.quantity, { unit: record.ingredient.unit })}
              </p>
              <p className={cn("text-xs", text.muted)}>
                {batch.expiryDate ? (
                  <span className={expiryDateTextClassName(urgency)}>
                    Exp {formatDate(batch.expiryDate)}
                  </span>
                ) : (
                  "No expiry"
                )}
                {showBadge && urgency ? (
                  <>
                    {" · "}
                    <StatusBadge tone={expiryUrgencyStatusTone(urgency)} className="inline-flex">
                      {expiryUrgencyLabel(urgency)}
                    </StatusBadge>
                  </>
                ) : null}
              </p>
            </div>
            <TableActionButton
              icon={Trash2}
              label="Report waste"
              iconOnly
              destructive
              onClick={() =>
                onReportWaste(
                  batch.id,
                  batch.ingredientId,
                  batch.quantity,
                  ingredientDisplayName(record),
                )
              }
            />
          </li>
        );
      })}
    </ul>
  );
}

type BatchInventoryMobileCardProps = {
  record: InventoryWithIngredient;
  batchEntry: IngredientBatchIndexEntry;
  onReportWaste: BatchInventoryTableProps["onReportWaste"];
};

function BatchInventoryMobileCard({
  record,
  batchEntry,
  onReportWaste,
}: BatchInventoryMobileCardProps) {
  const level = stockLevel(record.stock, record.minStock);
  const batchCount = batchEntry.batches.length;
  const statusBadge =
    batchEntry.expiredCount > 0 ? (
      <StatusBadge tone="danger" className="shrink-0">
        Expired
      </StatusBadge>
    ) : batchEntry.expiringCount > 0 ? (
      <StatusBadge tone="warning" className="shrink-0">
        Expiring
      </StatusBadge>
    ) : (
      <StatusBadge tone={stockLevelStatusTone(level)} className="shrink-0">
        {stockLevelLabel(level)}
      </StatusBadge>
    );

  return (
    <ListMobileCard>
      <div className="mb-1 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn("font-medium", text.primary)}>
            {ingredientDisplayName(record)}
          </p>
          <p className={cn("text-sm tabular-nums", text.secondary)}>
            {formatQuantity(record.stock, { unit: record.ingredient.unit })}
            <span className={text.muted}>
              {" "}
              · {batchCount} batch
              {batchCount === 1 ? "" : "es"}
            </span>
          </p>
        </div>
        {statusBadge}
      </div>
      <BatchMobileRows record={record} batchEntry={batchEntry} onReportWaste={onReportWaste} />
    </ListMobileCard>
  );
}

export function BatchInventoryTable({
  inventories,
  batches,
  loading,
  hasActiveFilters,
  onReportWaste,
}: BatchInventoryTableProps) {
  const emptyDescription = hasActiveFilters
    ? "No ingredients match your filters."
    : "No inventory records for this branch yet.";

  const batchIndex = useMemo(() => buildIngredientBatchIndex(batches), [batches]);

  const listPagination = useHubListPagination(
    { pageSize: 10 },
    `${inventories.length}-${hasActiveFilters}`,
  );

  const inventoryColumns = useMemo(
    () =>
      [
        {
          title: "Ingredient",
          key: "name",
          sorter: (a: InventoryWithIngredient, b: InventoryWithIngredient) =>
            ingredientDisplayName(a).localeCompare(ingredientDisplayName(b)),
          render: (_: unknown, record: InventoryWithIngredient) => (
            <span className={cn("font-medium", text.primary)}>
              {ingredientDisplayName(record)}
            </span>
          ),
        },
        {
          title: "Stock",
          key: "stock",
          sorter: (a: InventoryWithIngredient, b: InventoryWithIngredient) => a.stock - b.stock,
          render: (_: unknown, record: InventoryWithIngredient) => (
            <span className={cn("tabular-nums", text.primary)}>
              {formatQuantity(record.stock, { unit: record.ingredient.unit })}
            </span>
          ),
        },
        {
          title: "Min",
          key: "minStock",
          responsive: ["md"],
          sorter: (a: InventoryWithIngredient, b: InventoryWithIngredient) => a.minStock - b.minStock,
          render: (_: unknown, record: InventoryWithIngredient) => (
            <span className={cn("tabular-nums", tableCellMutedClassName())}>
              {formatQuantity(record.minStock)}
            </span>
          ),
        },
        {
          title: "Batches",
          key: "batches",
          responsive: ["lg"],
          render: (_: unknown, record: InventoryWithIngredient) => {
            const { batches: ingredientBatches, expiringCount, expiredCount } =
              getIngredientBatchIndexEntry(batchIndex, record.ingredient.id);
            const parts = [`${ingredientBatches.length}`];
            if (expiringCount > 0) parts.push(`${expiringCount} expiring`);
            if (expiredCount > 0) parts.push(`${expiredCount} expired`);
            return (
              <span className={cn("text-sm tabular-nums", text.secondary)}>
                {parts.join(" · ")}
              </span>
            );
          },
        },
        {
          title: "Status",
          key: "status",
          sorter: (a: InventoryWithIngredient, b: InventoryWithIngredient) =>
            batchStatusRank(a, batchIndex) - batchStatusRank(b, batchIndex),
          render: (_: unknown, record: InventoryWithIngredient) => {
            const { expiringCount, expiredCount } = getIngredientBatchIndexEntry(
              batchIndex,
              record.ingredient.id,
            );
            if (expiredCount > 0) {
              return <StatusBadge tone="danger">Expired</StatusBadge>;
            }
            if (expiringCount > 0) {
              return <StatusBadge tone="warning">Expiring</StatusBadge>;
            }
            const level = stockLevel(record.stock, record.minStock);
            return (
              <StatusBadge tone={stockLevelStatusTone(level)}>{stockLevelLabel(level)}</StatusBadge>
            );
          },
        },
      ] as ColumnsType<InventoryWithIngredient>,
    [batchIndex],
  );

  const expandedRowRender = useCallback(
    (record: InventoryWithIngredient) => {
      const ingredientBatches = getIngredientBatchIndexEntry(
        batchIndex,
        record.ingredient.id,
      ).batches;

      const batchColumns: ColumnsType<BatchWithSupplier> = [
        {
          title: "ID",
          dataIndex: "id",
          key: "id",
          responsive: ["md"],
        },
        {
          title: "Supplier",
          key: "supplier",
          responsive: ["lg"],
          render: (_: unknown, b: BatchWithSupplier) => (
            <span className={text.secondary}>{b.purchaseOrder?.supplier?.name || "—"}</span>
          ),
        },
        {
          title: "Qty",
          key: "quantity",
          render: (_: unknown, b: BatchWithSupplier) => (
            <span className={cn("tabular-nums", text.primary)}>
              {formatQuantity(b.quantity, { unit: record.ingredient.unit })}
            </span>
          ),
        },
        {
          title: "Expiry",
          key: "expiryDate",
          render: (_: unknown, b: BatchWithSupplier) => {
            if (!b.expiryDate) return <span className={text.muted}>—</span>;
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
          title: "",
          key: "action",
          width: 48,
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
          emptyDescription="No batches for this ingredient."
        />
      );
    },
    [batchIndex, onReportWaste],
  );

  const expandable = useMemo(
    () => ({ expandedRowRender }),
    [expandedRowRender],
  );

  return (
    <ResponsiveDataTableLayout
      mobile={
        loading ? (
          <ResponsiveDataTableLayout.Skeleton />
        ) : inventories.length === 0 ? (
          <ResponsiveDataTableLayout.Empty message={emptyDescription} />
        ) : (
          <PaginatedMobileList
            items={inventories}
            pageSize={listPagination.pageSize}
            page={listPagination.currentPage}
            onPageChange={listPagination.setCurrentPage}
          >
            {(record) => (
              <BatchInventoryMobileCard
                record={record}
                batchEntry={getIngredientBatchIndexEntry(batchIndex, record.ingredient.id)}
                onReportWaste={onReportWaste}
              />
            )}
          </PaginatedMobileList>
        )
      }
      desktop={
        <DataTable
          hideBorders
          pagination={listPagination.tablePagination}
          loading={loading}
          emptyDescription={emptyDescription}
          columns={inventoryColumns}
          dataSource={inventories}
          rowKey="id"
          expandable={expandable}
        />
      }
    />
  );
}
