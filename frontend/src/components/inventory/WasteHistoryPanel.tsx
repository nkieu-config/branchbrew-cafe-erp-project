"use client";

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import { DataTable } from "@/components/shared/data-table";
import {
  ListMobileCard,
  PaginatedMobileList,
  ResponsiveDataTableLayout,
} from "@/components/shared/responsive-data-table";
import { HubListPage } from "@/components/shared/hub-list-page";
import { ListFilterDate, ListFilterRow, ListFilterSelect } from "@/components/shared/list-filters";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime } from "@/lib/intl-date";
import { useHubListPagination } from "@/hooks/useHubListPagination";
import { tableCellMutedClassName } from "@/lib/theme/feedback";
import { inventorySectionPanelClassName } from "@/lib/theme/stock";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";
import type { WasteHistoryIngredient } from "@/lib/filters/waste-filters";
import type { WasteLog } from "@/types/api";

type WasteHistoryPanelProps = {
  logs: WasteLog[];
  filteredLogs: WasteLog[];
  historyIngredients: WasteHistoryIngredient[];
  historySearch: string;
  onHistorySearchChange: (value: string) => void;
  ingredientFilter: string;
  onIngredientFilterChange: (value: string) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
  hasHistoryFilters: boolean;
  onResetFilters: () => void;
  logsLoading: boolean;
  logsError: boolean;
  logsErr: unknown;
  logsFetching: boolean;
  onRefetchLogs: () => void;
};

function WasteLogMobileCard({ row }: { row: WasteLog }) {
  return (
    <ListMobileCard>
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn("font-medium", text.primary)}>
            {row.ingredient?.name ?? `#${row.ingredientId}`}
          </p>
          <time className={cn("text-xs tabular-nums", text.muted)} dateTime={row.createdAt}>
            {formatDateTime(row.createdAt)}
          </time>
        </div>
        <span className={cn("shrink-0 font-mono text-sm tabular-nums", text.subtle)}>
          {Number(row.quantity).toFixed(2)}
          {row.ingredient?.unit ? (
            <span className={cn("ml-1 text-xs", text.muted)}>{row.ingredient.unit}</span>
          ) : null}
        </span>
      </div>
      <p className={cn("mb-1 text-sm", text.secondary)}>{row.reason}</p>
      <p className={cn("text-xs", tableCellMutedClassName())}>
        {row.recordedBy?.name ?? "—"}
      </p>
    </ListMobileCard>
  );
}

export function WasteHistoryPanel({
  logs,
  filteredLogs,
  historyIngredients,
  historySearch,
  onHistorySearchChange,
  ingredientFilter,
  onIngredientFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  hasHistoryFilters,
  onResetFilters,
  logsLoading,
  logsError,
  logsErr,
  logsFetching,
  onRefetchLogs,
}: WasteHistoryPanelProps) {
  const historyColumns = useMemo(
    () =>
      [
        {
          title: "Date",
          dataIndex: "createdAt",
          key: "createdAt",
          width: 140,
          responsive: ["md"],
          render: (v: string) => (
            <span className={cn("whitespace-nowrap tabular-nums text-sm", text.subtle)}>
              {formatDateTime(v)}
            </span>
          ),
        },
        {
          title: "Ingredient",
          key: "ingredient",
          render: (_: unknown, row: WasteLog) => (
            <div className="min-w-0">
              <span className={cn("font-medium", text.primary)}>
                {row.ingredient?.name ?? `#${row.ingredientId}`}
              </span>
              <p className={cn("mt-0.5 text-xs md:hidden", text.muted)}>
                {formatDateTime(row.createdAt)}
              </p>
            </div>
          ),
        },
        {
          title: "Qty",
          dataIndex: "quantity",
          key: "quantity",
          align: "right" as const,
          width: 96,
          render: (qty: number, row: WasteLog) => (
            <span className={cn("font-mono tabular-nums text-sm", text.subtle)}>
              {Number(qty).toFixed(2)}
              {row.ingredient?.unit ? (
                <span className={cn("ml-1 text-xs", text.muted)}>{row.ingredient.unit}</span>
              ) : null}
            </span>
          ),
        },
        {
          title: "Reason",
          dataIndex: "reason",
          key: "reason",
          responsive: ["sm"],
          render: (reason: string) => (
            <span className={text.secondary}>{reason}</span>
          ),
        },
        {
          title: "By",
          key: "recordedBy",
          responsive: ["lg"],
          render: (_: unknown, row: WasteLog) => (
            <span className={tableCellMutedClassName()}>
              {row.recordedBy?.name ?? "—"}
            </span>
          ),
        },
      ] as ColumnsType<WasteLog>,
    [],
  );

  const emptyDescription = hasHistoryFilters
    ? "No waste logs match your filters."
    : "No waste entries recorded for this branch yet.";

  const listPagination = useHubListPagination(
    { pageSize: 15 },
    `${filteredLogs.length}-${hasHistoryFilters}`,
  );

  return (
    <div className={inventorySectionPanelClassName()}>
      <h2 className={cn("mb-4 text-base font-semibold", text.primary)}>History</h2>

      <HubListPage>
        <HubListPage.Error
          message={
            logsError ? getErrorMessage(logsErr, "Failed to load waste logs") : undefined
          }
          onRetry={onRefetchLogs}
          loading={logsFetching}
        />

        <HubListPage.Toolbar
          search={historySearch}
          onSearchChange={onHistorySearchChange}
          searchPlaceholder="Search reason, ingredient, or recorder…"
          showReset={hasHistoryFilters}
          onReset={onResetFilters}
          filters={
            <ListFilterRow>
              <ListFilterSelect
                value={ingredientFilter}
                onValueChange={onIngredientFilterChange}
                ariaLabel="Filter by ingredient"
                widthClassName="w-full sm:w-[200px]"
                options={[
                  { value: "ALL", label: "All ingredients" },
                  ...historyIngredients.map((ing) => ({
                    value: String(ing.id),
                    label: ing.name,
                  })),
                ]}
              />
              <ListFilterDate
                value={dateFrom}
                onChange={onDateFromChange}
                ariaLabel="Filter from date"
              />
              <ListFilterDate
                value={dateTo}
                onChange={onDateToChange}
                ariaLabel="Filter to date"
                min={dateFrom || undefined}
              />
            </ListFilterRow>
          }
        />

        <HubListPage.Count
          isLoading={logsLoading}
          isError={logsError}
          isFetching={logsFetching}
          hasActiveFilters={hasHistoryFilters}
          filteredCount={filteredLogs.length}
          totalCount={logs.length}
          itemLabel="entry"
          itemLabelPlural="entries"
          emptyLabel="No waste recorded yet"
        />

        <ResponsiveDataTableLayout
          mobile={
            logsLoading ? (
              <ResponsiveDataTableLayout.Skeleton />
            ) : filteredLogs.length === 0 ? (
              <ResponsiveDataTableLayout.Empty message={emptyDescription} />
            ) : (
              <PaginatedMobileList
                items={filteredLogs}
                pageSize={listPagination.pageSize}
                page={listPagination.currentPage}
                onPageChange={listPagination.setCurrentPage}
              >
                {(row) => <WasteLogMobileCard row={row} />}
              </PaginatedMobileList>
            )
          }
          desktop={
            <DataTable
              hideBorders
              pagination={listPagination.tablePagination}
              loading={logsLoading}
              rowKey="id"
              dataSource={filteredLogs}
              columns={historyColumns}
              emptyDescription={emptyDescription}
            />
          }
        />
      </HubListPage>
    </div>
  );
}
