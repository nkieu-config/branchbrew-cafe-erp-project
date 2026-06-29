"use client";

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import { History } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { HubListPage } from "@/components/shared/hub-list-page";
import { ListFilterDate, ListFilterRow, ListFilterSelect } from "@/components/shared/list-filters";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime } from "@/lib/intl-date";
import { hubListDataTableProps } from "@/lib/theme/data-table";
import { tableCellMutedClassName } from "@/lib/theme/feedback";
import { metricValueClassName } from "@/lib/theme/metric";
import { formPanelHeaderClassName, inventorySectionPanelClassName } from "@/lib/theme/stock";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";
import type { WasteHistoryIngredient } from "@/lib/waste-filters";
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
          title: "Recorded by",
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

  return (
    <div className={inventorySectionPanelClassName()}>
      <div className={formPanelHeaderClassName("mb-4")}>
        <h2 className={typeHeadingClassName("text-lg flex items-center gap-2")}>
          <History className={cn("w-5 h-5", metricValueClassName("slate"))} aria-hidden />
          Waste History
        </h2>
        <p className={cn("text-sm mt-1", text.muted)}>
          Recent waste entries for this branch.
        </p>
      </div>

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

        <DataTable
          {...hubListDataTableProps()}
          loading={logsLoading}
          rowKey="id"
          dataSource={filteredLogs}
          columns={historyColumns}
          scroll={{ x: undefined }}
          emptyDescription={
            hasHistoryFilters
              ? "No waste logs match your filters."
              : "No waste entries recorded for this branch yet."
          }
        />
      </HubListPage>
    </div>
  );
}
