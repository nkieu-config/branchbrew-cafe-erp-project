"use client";

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge, accountTypeTone } from "@/components/shared/status-badge";
import {
  accountTypeLabel,
} from "@/lib/account-filters";
import { hubListDataTableProps } from "@/lib/theme/data-table";
import { tableCellMutedClassName } from "@/lib/theme/feedback";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName, typeUiLabelClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";
import type { AccountTableRow } from "@/types/api";

type ChartOfAccountsTableProps = {
  accounts: AccountTableRow[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  showSeedAction: boolean;
};

export function ChartOfAccountsTable({
  accounts,
  isLoading,
  hasActiveFilters,
  showSeedAction,
}: ChartOfAccountsTableProps) {
  const columns = useMemo(
    () =>
      [
        {
          title: "Code",
          dataIndex: "code",
          key: "code",
          width: 150,
          render: (code: string, record: AccountTableRow) =>
            "isGroup" in record && record.isGroup ? (
              <span className={cn(typeUiLabelClassName("uppercase tracking-wide"), text.primary)}>
                {accountTypeLabel(record.type)}
              </span>
            ) : (
              <span className="font-mono font-medium tabular-nums">{code}</span>
            ),
        },
        {
          title: "Name",
          dataIndex: "name",
          key: "name",
          render: (name: string, record: AccountTableRow) =>
            "isGroup" in record && record.isGroup ? (
              <span className={typeHeadingClassName()}>{name}</span>
            ) : (
              <span className={text.secondary}>{name}</span>
            ),
        },
        {
          title: "Type",
          dataIndex: "type",
          key: "type",
          width: 150,
          responsive: ["md"],
          render: (type: string, record: AccountTableRow) => {
            if ("isGroup" in record && record.isGroup) return null;
            return (
              <StatusBadge tone={accountTypeTone(type)}>{accountTypeLabel(type)}</StatusBadge>
            );
          },
        },
        {
          title: "Description",
          dataIndex: "description",
          key: "description",
          responsive: ["lg"],
          render: (description: string | null | undefined, record: AccountTableRow) => {
            if ("isGroup" in record && record.isGroup) return null;
            return description?.trim() ? (
              <span className={cn("line-clamp-2 text-sm", text.subtle)}>{description}</span>
            ) : (
              <span className={text.muted}>—</span>
            );
          },
        },
        {
          title: "Status",
          dataIndex: "isActive",
          key: "isActive",
          width: 110,
          render: (isActive: boolean, record: AccountTableRow) => {
            if ("isGroup" in record && record.isGroup) {
              return (
                <span className={cn("text-xs tabular-nums", text.muted)}>
                  {record.children.length} account{record.children.length === 1 ? "" : "s"}
                </span>
              );
            }
            return isActive ? (
              <StatusBadge tone="success">Active</StatusBadge>
            ) : (
              <StatusBadge tone="neutral">Inactive</StatusBadge>
            );
          },
        },
      ] as ColumnsType<AccountTableRow>,
    [],
  );

  return (
    <>
      <DataTable
        {...hubListDataTableProps()}
        columns={columns}
        dataSource={accounts}
        rowKey="id"
        loading={isLoading}
        pagination={false}
        defaultExpandAllRows
        emptyDescription={
          hasActiveFilters
            ? "No accounts match the current filters."
            : showSeedAction
              ? "Seed the chart of accounts to get started."
              : "No accounts found."
        }
      />
      {!isLoading && accounts.length > 0 && (
        <p className={cn("mt-3 text-xs", tableCellMutedClassName())}>
          Accounts are grouped by type. Expand or collapse sections using the row controls.
        </p>
      )}
    </>
  );
}
