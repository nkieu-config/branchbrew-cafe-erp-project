"use client";

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { Edit3 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge, employeeRoleTone } from "@/components/shared/status-badge";
import { TableActionButton } from "@/components/shared/table-action-button";
import {
  employeeHasMissingRate,
} from "@/lib/employee-filters";
import { buildHrPayrollUrl } from "@/lib/hr-hub-url";
import { formatCurrency } from "@/lib/money";
import { hubListDataTableProps } from "@/lib/theme/data-table";
import { tableCellMutedClassName } from "@/lib/theme/feedback";
import { expandedRowPanelClassName, inlineLinkClassName, tableActionAccentClassName } from "@/lib/theme/hub-primitives";
import { hrAvatarClassName } from "@/lib/theme/hub-hr";
import { metricValueClassName } from "@/lib/theme/metric";
import { text } from "@/lib/theme/surface";
import { typeUiLabelClassName } from "@/lib/theme/typography";
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
                <div className={typeUiLabelClassName(cn("truncate", text.primary))}>
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
            <StatusBadge tone={employeeRoleTone(roleText)} className={typeUiLabelClassName()}>
              {roleText}
            </StatusBadge>
          ),
        },
        {
          title: "Type",
          dataIndex: "employmentType",
          key: "type",
          responsive: ["md"],
          render: (typeText: string) => (
            <span className={text.subtle}>
              {typeText ? typeText.replace("_", " ") : "Not set"}
            </span>
          ),
        },
        {
          title: "Branch",
          dataIndex: ["branch", "name"],
          key: "branch",
          responsive: ["lg"],
          render: (name: string) =>
            name ? (
              <StatusBadge tone="category">{name}</StatusBadge>
            ) : (
              <span className={text.muted}>HQ / All</span>
            ),
        },
        {
          title: "Hourly Rate",
          dataIndex: "hourlyRate",
          key: "rate",
          align: "right" as const,
          responsive: ["md"],
          render: (_: unknown, record: User) =>
            employeeHasMissingRate(record) ? (
              <StatusBadge tone="warning" className={typeUiLabelClassName("tabular-nums")}>
                Not set
              </StatusBadge>
            ) : (
              <span className={typeUiLabelClassName(cn("tabular-nums", metricValueClassName("emerald")))}>
                {formatCurrency(record.hourlyRate)} / hr
              </span>
            ),
        },
        {
          title: "",
          key: "action",
          align: "right" as const,
          width: 72,
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
      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <dt className={cn("text-xs font-medium uppercase tracking-wide", text.muted)}>Email</dt>
          <dd className={cn("mt-1", text.primary)}>{record.email}</dd>
        </div>
        <div>
          <dt className={cn("text-xs font-medium uppercase tracking-wide", text.muted)}>
            Employment type
          </dt>
          <dd className={cn("mt-1", text.primary)}>
            {record.employmentType?.replace("_", " ") ?? "Not set"}
          </dd>
        </div>
        <div>
          <dt className={cn("text-xs font-medium uppercase tracking-wide", text.muted)}>
            Base salary
          </dt>
          <dd className={typeUiLabelClassName(cn("mt-1 tabular-nums", metricValueClassName("blue")))}>
            {record.baseSalary != null && record.baseSalary > 0
              ? formatCurrency(record.baseSalary)
              : "—"}
          </dd>
        </div>
      </dl>
      {canLinkPayroll && (
        <div className="mt-4">
          <Link href={buildHrPayrollUrl({ employee: record.id })} className={inlineLinkClassName()}>
            View payroll for this employee
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <DataTable
      {...hubListDataTableProps()}
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
        rowExpandable: () => true,
      }}
    />
  );
}
