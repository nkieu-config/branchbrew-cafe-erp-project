"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ColumnsType } from "antd/es/table";
import { ArrowDownToLine, ClipboardCheck } from "lucide-react";
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
  stockLevel,
  stockLevelLabel,
  stockLevelStatusTone,
} from "@/lib/theme/stock";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";
import type { BranchInventory } from "@/types/api";

type InventoryRow = BranchInventory & { ingredient?: { name: string; unit: string } };

type InventoryOverviewTableProps = {
  rows: InventoryRow[];
  loading: boolean;
  hasActiveFilters: boolean;
  showGrnAction: boolean;
  ingredientDisplayName: (record: InventoryRow) => string;
};

type InventoryOverviewActionsProps = {
  showGrnAction: boolean;
  onViewBatches: () => void;
  onReceive: () => void;
};

function InventoryOverviewActions({
  showGrnAction,
  onViewBatches,
  onReceive,
}: InventoryOverviewActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <TableActionButton
        label="Batches"
        icon={ClipboardCheck}
        tone="emerald"
        onClick={onViewBatches}
      />
      {showGrnAction && (
        <TableActionButton
          label="Receive"
          icon={ArrowDownToLine}
          tone="blue"
          onClick={onReceive}
        />
      )}
    </div>
  );
}

type InventoryOverviewMobileCardProps = InventoryOverviewActionsProps & {
  row: InventoryRow;
  ingredientDisplayName: (record: InventoryRow) => string;
};

function InventoryOverviewMobileCard({
  row,
  ingredientDisplayName,
  showGrnAction,
  onViewBatches,
  onReceive,
}: InventoryOverviewMobileCardProps) {
  const level = stockLevel(row.stock, row.minStock);
  const tone = stockLevelStatusTone(level);
  const label = stockLevelLabel(level);
  const name = ingredientDisplayName(row);
  const unit = row.ingredient?.unit ?? "";

  return (
    <ListMobileCard>
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn("font-medium", text.primary)}>{name}</p>
          <p className={cn("text-sm tabular-nums", text.secondary)}>
            {row.stock.toFixed(2)}
            {unit ? ` ${unit}` : ""}
            <span className={text.muted}> · min {row.minStock.toFixed(2)}</span>
          </p>
        </div>
        <StatusBadge tone={tone} className="shrink-0">
          {label}
        </StatusBadge>
      </div>
      {level !== "ok" && (
        <InventoryOverviewActions
          showGrnAction={showGrnAction}
          onViewBatches={onViewBatches}
          onReceive={onReceive}
        />
      )}
    </ListMobileCard>
  );
}

export function InventoryOverviewTable({
  rows,
  loading,
  hasActiveFilters,
  showGrnAction,
  ingredientDisplayName,
}: InventoryOverviewTableProps) {
  const router = useRouter();
  const emptyDescription = hasActiveFilters
    ? "No ingredients match your filters."
    : "No inventory records for this branch yet.";

  const listPagination = useHubListPagination(
    { pageSize: 15 },
    `${rows.length}-${hasActiveFilters}`,
  );

  const columns = useMemo(
    () =>
      [
        {
          title: "Ingredient",
          key: "name",
          sorter: (a: InventoryRow, b: InventoryRow) =>
            ingredientDisplayName(a).localeCompare(ingredientDisplayName(b)),
          render: (_: unknown, record: InventoryRow) => (
            <span className={cn("font-medium", text.primary)}>
              {ingredientDisplayName(record)}
            </span>
          ),
        },
        {
          title: "Stock",
          key: "stock",
          sorter: (a: InventoryRow, b: InventoryRow) => a.stock - b.stock,
          render: (_: unknown, record: InventoryRow) => (
            <span className={cn("tabular-nums font-medium", text.primary)}>
              {record.stock.toFixed(2)}
            </span>
          ),
        },
        {
          title: "Min",
          key: "minStock",
          responsive: ["md"],
          sorter: (a: InventoryRow, b: InventoryRow) => a.minStock - b.minStock,
          render: (_: unknown, record: InventoryRow) => (
            <span className={cn("tabular-nums", tableCellMutedClassName())}>
              {record.minStock.toFixed(2)}
            </span>
          ),
        },
        {
          title: "Unit",
          key: "unit",
          responsive: ["lg"],
          render: (_: unknown, record: InventoryRow) => (
            <span className={tableCellMutedClassName()}>{record.ingredient?.unit ?? "—"}</span>
          ),
        },
        {
          title: "Status",
          key: "status",
          sorter: (a: InventoryRow, b: InventoryRow) => {
            const order = { out: 0, low: 1, ok: 2 };
            return order[stockLevel(a.stock, a.minStock)] - order[stockLevel(b.stock, b.minStock)];
          },
          render: (_: unknown, record: InventoryRow) => {
            const level = stockLevel(record.stock, record.minStock);
            return (
              <StatusBadge tone={stockLevelStatusTone(level)} className="w-fit">
                {stockLevelLabel(level)}
              </StatusBadge>
            );
          },
        },
        {
          title: "",
          key: "actions",
          width: 120,
          responsive: ["md"],
          render: (_: unknown, record: InventoryRow) => {
            const level = stockLevel(record.stock, record.minStock);
            if (level === "ok") return null;
            return (
              <InventoryOverviewActions
                showGrnAction={showGrnAction}
                onViewBatches={() => router.push("/inventory/batches")}
                onReceive={() => router.push("/inventory/stock-in")}
              />
            );
          },
        },
      ] satisfies ColumnsType<InventoryRow>,
    [ingredientDisplayName, router, showGrnAction],
  );

  return (
    <ResponsiveDataTableLayout
      mobile={
        loading ? (
          <ResponsiveDataTableLayout.Skeleton />
        ) : rows.length === 0 ? (
          <ResponsiveDataTableLayout.Empty message={emptyDescription} />
        ) : (
          <PaginatedMobileList
            items={rows}
            pageSize={listPagination.pageSize}
            page={listPagination.currentPage}
            onPageChange={listPagination.setCurrentPage}
          >
            {(row) => (
              <InventoryOverviewMobileCard
                row={row}
                ingredientDisplayName={ingredientDisplayName}
                showGrnAction={showGrnAction}
                onViewBatches={() => router.push("/inventory/batches")}
                onReceive={() => router.push("/inventory/stock-in")}
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
          columns={columns}
          dataSource={rows}
          rowKey="id"
        />
      }
    />
  );
}
