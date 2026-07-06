"use client";

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import { DataTable } from "@/components/shared/data-table";
import {
  ListMobileCard,
  PaginatedMobileList,
  ResponsiveDataTableLayout,
} from "@/components/shared/responsive-data-table";
import { accountTypeLabel } from "@/lib/filters/account-filters";
import { hubListDataTableProps } from "@/lib/theme/data-table";
import { financeMutedMetaClassName } from "@/lib/theme/finance";
import { text } from "@/lib/theme/surface";
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
  const emptyDescription = hasActiveFilters
    ? "No accounts match the current filters."
    : showSeedAction
      ? "Seed accounts to get started."
      : "No accounts found.";

  const columns = useMemo(
    () =>
      [
        {
          title: "Code",
          dataIndex: "code",
          key: "code",
          width: 120,
          render: (code: string, record: AccountTableRow) =>
            "isGroup" in record && record.isGroup ? (
              <span className={cn("text-xs font-medium uppercase tracking-wide", text.primary)}>
                {accountTypeLabel(record.type)}
              </span>
            ) : (
              <span className="font-mono text-sm tabular-nums">{code}</span>
            ),
        },
        {
          title: "Name",
          dataIndex: "name",
          key: "name",
          render: (name: string, record: AccountTableRow) =>
            "isGroup" in record && record.isGroup ? (
              <span className={cn("font-medium", text.primary)}>{name}</span>
            ) : (
              <span className={text.secondary}>{name}</span>
            ),
        },
        {
          title: "Description",
          dataIndex: "description",
          key: "description",
          responsive: ["lg"],
          render: (description: string | null | undefined, record: AccountTableRow) => {
            if ("isGroup" in record && record.isGroup) {
              return (
                <span className={financeMutedMetaClassName()}>
                  {record.children.length} account{record.children.length === 1 ? "" : "s"}
                </span>
              );
            }
            return description?.trim() ? (
              <span className={cn("line-clamp-2 text-sm", text.muted)}>{description}</span>
            ) : (
              <span className={text.muted}>—</span>
            );
          },
        },
        {
          title: "Status",
          dataIndex: "isActive",
          key: "isActive",
          width: 80,
          render: (isActive: boolean, record: AccountTableRow) => {
            if ("isGroup" in record && record.isGroup) return null;
            return (
              <span className={isActive ? text.secondary : text.muted}>
                {isActive ? "Active" : "Off"}
              </span>
            );
          },
        },
      ] as ColumnsType<AccountTableRow>,
    [],
  );

  const groupRows = accounts.filter(
    (row): row is Extract<AccountTableRow, { isGroup: true }> =>
      "isGroup" in row && row.isGroup === true,
  );

  return (
    <ResponsiveDataTableLayout
      mobile={
        isLoading ? (
          <ResponsiveDataTableLayout.Skeleton rows={3} />
        ) : accounts.length === 0 ? (
          <ResponsiveDataTableLayout.Empty message={emptyDescription} />
        ) : (
          <PaginatedMobileList items={groupRows} pageSize={0}>
            {(group) => {
              const totalChildren = group.children.length;

              return (
                <ListMobileCard>
                  <div className="mb-3">
                    <p className={cn("text-xs font-medium uppercase tracking-wide", text.primary)}>
                      {accountTypeLabel(group.type)}
                    </p>
                    <p className={cn("font-medium", text.primary)}>{group.name}</p>
                    <p className={financeMutedMetaClassName()}>
                      {totalChildren} account{totalChildren === 1 ? "" : "s"}
                    </p>
                  </div>
                  {group.children.length > 0 ? (
                    <ul className="space-y-2 border-t border-[var(--table-row-border)] pt-2 text-sm">
                      {group.children.map((account) => (
                        <li
                          key={account.id}
                          className="flex items-start justify-between gap-3 border-b border-[var(--table-row-border)] pb-2 last:border-0 last:pb-0"
                        >
                          <div className="min-w-0">
                            <p className={cn("font-mono text-xs tabular-nums", text.muted)}>
                              {account.code}
                            </p>
                            <p className={text.secondary}>{account.name}</p>
                            {account.description?.trim() ? (
                              <p className={cn("line-clamp-2 text-xs", text.muted)}>
                                {account.description}
                              </p>
                            ) : null}
                          </div>
                          <span
                            className={cn(
                              "shrink-0 text-xs",
                              account.isActive ? text.secondary : text.muted,
                            )}
                          >
                            {account.isActive ? "Active" : "Off"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={cn("text-sm", text.muted)}>No accounts in this group.</p>
                  )}
                </ListMobileCard>
              );
            }}
          </PaginatedMobileList>
        )
      }
      desktop={
        <DataTable
          {...hubListDataTableProps()}
          columns={columns}
          dataSource={accounts}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          defaultExpandAllRows
          emptyDescription={emptyDescription}
        />
      }
    />
  );
}
