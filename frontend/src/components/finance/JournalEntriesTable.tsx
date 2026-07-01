"use client";

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import { DataTable } from "@/components/shared/data-table";
import {
  ListMobileCard,
  PaginatedMobileList,
  ResponsiveDataTableLayout,
} from "@/components/shared/responsive-data-table";
import { StatusBadge, journalStatusTone } from "@/components/shared/status-badge";
import { JournalLinesPanel } from "@/components/finance/JournalLinesPanel";
import { formatDate } from "@/lib/intl-date";
import { journalStatusLabel } from "@/lib/ledger-filters";
import { useHubListPagination } from "@/hooks/useHubListPagination";
import { financeMutedMetaClassName } from "@/lib/theme/finance";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";
import type { JournalEntry } from "@/types/api";

type JournalEntriesTableProps = {
  entries: JournalEntry[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  showSeedAction: boolean;
};

export function JournalEntriesTable({
  entries,
  isLoading,
  hasActiveFilters,
  showSeedAction,
}: JournalEntriesTableProps) {
  const emptyDescription = hasActiveFilters
    ? "No journal entries match the current filters."
    : showSeedAction
      ? "Seed accounts to begin posting journal entries."
      : "No journal entries for this scope.";

  const listPagination = useHubListPagination(
    { pageSize: 20 },
    `${entries.length}-${hasActiveFilters}`,
  );

  const columns = useMemo(
    () =>
      [
        {
          title: "Date",
          dataIndex: "date",
          key: "date",
          width: 110,
          render: (date: string) => (
            <span className={cn("tabular-nums", text.primary)}>{formatDate(date)}</span>
          ),
        },
        {
          title: "Ref",
          dataIndex: "reference",
          key: "reference",
          width: 100,
          responsive: ["md"],
          render: (ref: string | null | undefined) => (
            <span className={financeMutedMetaClassName("font-mono")}>{ref || "—"}</span>
          ),
        },
        {
          title: "Description",
          dataIndex: "description",
          key: "description",
          render: (description: string) => (
            <span className={cn("line-clamp-2", text.secondary)}>{description}</span>
          ),
        },
        {
          title: "Status",
          dataIndex: "status",
          key: "status",
          width: 100,
          render: (status: string) => (
            <StatusBadge tone={journalStatusTone(status)}>{journalStatusLabel(status)}</StatusBadge>
          ),
        },
      ] as ColumnsType<JournalEntry>,
    [],
  );

  return (
    <ResponsiveDataTableLayout
      mobile={
        isLoading ? (
          <ResponsiveDataTableLayout.Skeleton />
        ) : entries.length === 0 ? (
          <ResponsiveDataTableLayout.Empty message={emptyDescription} />
        ) : (
          <PaginatedMobileList
            items={entries}
            pageSize={listPagination.pageSize}
            page={listPagination.currentPage}
            onPageChange={listPagination.setCurrentPage}
          >
            {(entry) => (
              <ListMobileCard>
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={cn("tabular-nums text-sm", text.muted)}>{formatDate(entry.date)}</p>
                    <p className={cn("font-medium", text.primary)}>{entry.description}</p>
                    {entry.reference ? (
                      <p className={financeMutedMetaClassName("font-mono")}>{entry.reference}</p>
                    ) : null}
                  </div>
                  <StatusBadge tone={journalStatusTone(entry.status)} className="shrink-0">
                    {journalStatusLabel(entry.status)}
                  </StatusBadge>
                </div>
                {(entry.lines?.length ?? 0) > 0 ? <JournalLinesPanel entry={entry} /> : null}
              </ListMobileCard>
            )}
          </PaginatedMobileList>
        )
      }
      desktop={
        <DataTable
          hideBorders
          pagination={listPagination.tablePagination}
          columns={columns}
          dataSource={entries}
          rowKey="id"
          loading={isLoading}
          expandable={{
            expandedRowRender: (record: JournalEntry) => <JournalLinesPanel entry={record} />,
            rowExpandable: (record) => (record.lines?.length ?? 0) > 0,
          }}
          emptyDescription={emptyDescription}
        />
      }
    />
  );
}
