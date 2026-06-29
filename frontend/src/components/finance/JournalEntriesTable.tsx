"use client";

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge, journalStatusTone } from "@/components/shared/status-badge";
import { JournalLinesPanel } from "@/components/finance/JournalLinesPanel";
import { formatDate } from "@/lib/intl-date";
import { journalStatusLabel } from "@/lib/ledger-filters";
import { hubListDataTableProps } from "@/lib/theme/data-table";
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
  const columns = useMemo(
    () =>
      [
        {
          title: "Date",
          dataIndex: "date",
          key: "date",
          render: (date: string) => (
            <span className={cn("font-medium", text.subtle)}>{formatDate(date)}</span>
          ),
        },
        {
          title: "Reference",
          dataIndex: "reference",
          key: "reference",
          render: (ref: string | null | undefined) => (
            <StatusBadge tone="info" className="font-mono">
              {ref || "—"}
            </StatusBadge>
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
          title: "Lines",
          key: "lines",
          responsive: ["md"],
          render: (_: unknown, record: JournalEntry) => (
            <span className={cn("tabular-nums text-sm", text.muted)}>
              {record.lines?.length ?? 0}
            </span>
          ),
        },
        {
          title: "Status",
          dataIndex: "status",
          key: "status",
          render: (status: string) => (
            <StatusBadge tone={journalStatusTone(status)}>
              {journalStatusLabel(status)}
            </StatusBadge>
          ),
        },
      ] as ColumnsType<JournalEntry>,
    [],
  );

  return (
    <DataTable
      {...hubListDataTableProps({ pageSize: 20 })}
      columns={columns}
      dataSource={entries}
      rowKey="id"
      loading={isLoading}
      expandable={{
        expandedRowRender: (record: JournalEntry) => <JournalLinesPanel entry={record} />,
        rowExpandable: (record) => (record.lines?.length ?? 0) > 0,
      }}
      emptyDescription={
        hasActiveFilters
          ? "No journal entries match the current filters."
          : showSeedAction
            ? "Seed the chart of accounts to begin posting journal entries."
            : "No journal entries found for this branch scope."
      }
    />
  );
}
