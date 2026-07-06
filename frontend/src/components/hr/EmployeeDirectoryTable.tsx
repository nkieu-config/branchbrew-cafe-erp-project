"use client";

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { Edit3 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { DataTable } from "@/components/shared/data-table";
import {
  ListMobileCard,
  PaginatedMobileList,
  ResponsiveDataTableLayout,
} from "@/components/shared/responsive-data-table";
import { StatusBadge, employeeRoleTone, formatStatusLabel } from "@/components/shared/status-badge";
import { TableActionButton } from "@/components/shared/table-action-button";
import { employeeHasMissingRate } from "@/lib/filters/employee-filters";
import { buildHrPayrollUrl } from "@/lib/hr-hub-url";
import { formatCurrency } from "@/lib/money";
import { useHubListPagination } from "@/hooks/useHubListPagination";
import { tableCellMutedClassName } from "@/lib/theme/feedback";
import { expandedRowPanelClassName, inlineLinkClassName, tableActionAccentClassName } from "@/lib/theme/hub-primitives";
import { hrAvatarClassName, hrMutedMetaClassName } from "@/lib/theme/hub-hr";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";
import type { User } from "@/types/api";

type EmployeeDirectoryTableProps = {
  employees: User[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  canEditCompensation: boolean;
  canLinkPayroll: boolean;
  onEditRate: (record: User) => void;
};

export function EmployeeDirectoryTable({
  employees,
  isLoading,
  hasActiveFilters,
  canEditCompensation,
  canLinkPayroll,
  onEditRate,
}: EmployeeDirectoryTableProps) {
  const listPagination = useHubListPagination(
    { pageSize: 15 },
    `${employees.length}-${hasActiveFilters}`,
  );

  const columns = useMemo(
    () =>
      [
        {
          title: "Employee",
          key: "employee",
          render: (_: unknown, record: User) => (
            <div className="flex items-center gap-3">
              <Avatar className={hrAvatarClassName()}>{record.name?.charAt(0) || "U"}</Avatar>
              <div className="min-w-0">
                <div className={cn("truncate font-medium", text.primary)}>
                  {canLinkPayroll ? (
                    <Link href={buildHrPayrollUrl({ employee: record.id })} className={inlineLinkClassName()}>
                      {record.name || "Unknown User"}
                    </Link>
                  ) : (
                    record.name || "Unknown User"
                  )}
                </div>
                <div className={cn("text-xs truncate", tableCellMutedClassName())}>{record.email}</div>
              </div>
            </div>
          ),
        },
        {
          title: "Role",
          dataIndex: "role",
          key: "role",
          render: (roleText: string) => (
            <StatusBadge tone={employeeRoleTone(roleText)}>{formatStatusLabel(roleText)}</StatusBadge>
          ),
        },
        {
          title: "Type",
          dataIndex: "employmentType",
          key: "type",
          responsive: ["md"],
          render: (typeText: string) => (
            <span className={hrMutedMetaClassName()}>
              {typeText ? typeText.replace("_", " ") : "—"}
            </span>
          ),
        },
        {
          title: "Branch",
          dataIndex: "branchId",
          key: "branch",
          responsive: ["lg"],
          render: (branchId: number | null) =>
            branchId != null ? (
              <span className={text.secondary}>Branch #{branchId}</span>
            ) : (
              <span className={text.muted}>HQ</span>
            ),
        },
        {
          title: "Rate",
          dataIndex: "hourlyRate",
          key: "rate",
          align: "right" as const,
          responsive: ["md"],
          render: (_: unknown, record: User) =>
            employeeHasMissingRate(record) ? (
              <span className={text.muted}>Not set</span>
            ) : (
              <span className={cn("tabular-nums", text.primary)}>
                {formatCurrency(record.hourlyRate)}/hr
              </span>
            ),
        },
        {
          title: "",
          key: "action",
          align: "right" as const,
          width: 56,
          render: (_: unknown, record: User) =>
            canEditCompensation ? (
              <TableActionButton
                icon={Edit3}
                label={`Edit rate for ${record.name ?? record.email}`}
                iconOnly
                onClick={() => onEditRate(record)}
                className={tableActionAccentClassName("indigo")}
              />
            ) : null,
        },
      ] as ColumnsType<User>,
    [canEditCompensation, canLinkPayroll, onEditRate],
  );

  const expandedRowRender = (record: User) => (
    <div className={expandedRowPanelClassName()}>
      <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
        <div>
          <span className={hrMutedMetaClassName()}>Type </span>
          <span className={text.primary}>
            {record.employmentType?.replace("_", " ") ?? "—"}
          </span>
        </div>
        <div>
          <span className={hrMutedMetaClassName()}>Base salary </span>
          <span className={cn("tabular-nums", text.primary)}>
            {record.baseSalary != null && record.baseSalary > 0
              ? formatCurrency(record.baseSalary)
              : "—"}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <ResponsiveDataTableLayout
      mobile={
        isLoading ? (
          <ResponsiveDataTableLayout.Skeleton />
        ) : employees.length === 0 ? (
          <ResponsiveDataTableLayout.Empty
            message={
              hasActiveFilters
                ? "No employees match your filters."
                : "No employees found for this branch."
            }
          />
        ) : (
          <PaginatedMobileList
            items={employees}
            pageSize={listPagination.pageSize}
            page={listPagination.currentPage}
            onPageChange={listPagination.setCurrentPage}
          >
            {(record) => (
              <ListMobileCard>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <Avatar className={hrAvatarClassName()}>{record.name?.charAt(0) || "U"}</Avatar>
                    <div className="min-w-0">
                      <p className={cn("truncate font-medium", text.primary)}>
                        {canLinkPayroll ? (
                          <Link href={buildHrPayrollUrl({ employee: record.id })} className={inlineLinkClassName()}>
                            {record.name || "Unknown User"}
                          </Link>
                        ) : (
                          record.name || "Unknown User"
                        )}
                      </p>
                      <p className={cn("truncate text-xs", tableCellMutedClassName())}>{record.email}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StatusBadge tone={employeeRoleTone(record.role)}>{formatStatusLabel(record.role)}</StatusBadge>
                        {record.employmentType ? (
                          <span className={hrMutedMetaClassName()}>
                            {record.employmentType.replace("_", " ")}
                          </span>
                        ) : null}
                      </div>
                      <p className={cn("mt-1 text-sm", text.secondary)}>
                        {record.branchId != null ? `Branch #${record.branchId}` : "HQ"}
                        {employeeHasMissingRate(record) ? (
                          <span className={cn("ml-2", text.muted)}>· Rate not set</span>
                        ) : (
                          <span className={cn("ml-2 tabular-nums", text.primary)}>
                            · {formatCurrency(record.hourlyRate)}/hr
                          </span>
                        )}
                      </p>
                      {record.baseSalary != null && record.baseSalary > 0 ? (
                        <p className={cn("mt-0.5 text-xs", text.muted)}>
                          Base {formatCurrency(record.baseSalary)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {canEditCompensation ? (
                    <TableActionButton
                      icon={Edit3}
                      label={`Edit rate for ${record.name ?? record.email}`}
                      iconOnly
                      onClick={() => onEditRate(record)}
                      className={tableActionAccentClassName("indigo")}
                    />
                  ) : null}
                </div>
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
          dataSource={employees}
          rowKey="id"
          loading={isLoading}
          emptyDescription={
            hasActiveFilters
              ? "No employees match your filters."
              : "No employees found for this branch."
          }
          expandable={{
            expandedRowRender,
            rowExpandable: (record) =>
              Boolean(record.employmentType) ||
              (record.baseSalary != null && record.baseSalary > 0),
          }}
        />
      }
    />
  );
}
