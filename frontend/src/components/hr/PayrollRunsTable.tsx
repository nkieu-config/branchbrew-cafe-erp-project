"use client";

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import { CheckCircle, FileText } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge, payrollStatusTone } from "@/components/shared/status-badge";
import { TableActionButton } from "@/components/shared/table-action-button";
import { PayrollPayslipPanel } from "@/components/hr/PayrollPayslipPanel";
import {
  type PayrollRunWithPayslips,
  filterPayslipsForEmployee,
  formatPayrollPeriod,
  payrollRunPayslipCount,
  payrollRunTotalNet,
  payrollStatusLabel,
} from "@/lib/payroll-filters";
import { formatBaht } from "@/lib/money";
import { hubListDataTableProps } from "@/lib/theme/data-table";
import { tableActionAccentClassName } from "@/lib/theme/hub-primitives";
import { metricValueClassName } from "@/lib/theme/metric";
import { text } from "@/lib/theme/surface";
import { typeUiLabelClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";
import type { PayrollRun } from "@/types/api";

type PayrollRunsTableProps = {
  payrollRuns: PayrollRunWithPayslips[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  hasCurrentMonthRun: boolean;
  currentPeriodLabel: string;
  employeeId: number | null;
  employeeName: string | null | undefined;
  defaultExpandedRowKeys: number[] | undefined;
  onApprove: (run: PayrollRunWithPayslips) => void;
};

export function PayrollRunsTable({
  payrollRuns,
  isLoading,
  hasActiveFilters,
  hasCurrentMonthRun,
  currentPeriodLabel,
  employeeId,
  employeeName,
  defaultExpandedRowKeys,
  onApprove,
}: PayrollRunsTableProps) {
  const columns = useMemo(
    () =>
      [
        {
          title: "Period",
          key: "period",
          render: (_: unknown, record: PayrollRunWithPayslips) => (
            <div className="min-w-0">
              <div className={typeUiLabelClassName(text.primary)}>
                {formatPayrollPeriod(record.month, record.year)}
              </div>
              <div className={cn("text-xs tabular-nums", text.muted)}>
                Run #{record.id}
              </div>
            </div>
          ),
        },
        {
          title: "Payslips",
          key: "payslips",
          render: (_: unknown, record: PayrollRunWithPayslips) => {
            const count = payrollRunPayslipCount(record);
            return (
              <div className={cn("flex items-center gap-2 tabular-nums", text.secondary)}>
                <FileText className={cn("w-4 h-4 shrink-0", text.muted)} aria-hidden />
                {count} employee{count === 1 ? "" : "s"}
              </div>
            );
          },
        },
        {
          title: "Total net",
          key: "totalAmount",
          align: "right" as const,
          render: (_: unknown, record: PayrollRunWithPayslips) => (
            <span className={typeUiLabelClassName(cn("font-mono tabular-nums", metricValueClassName("emerald")))}>
              {formatBaht(payrollRunTotalNet(record))}
            </span>
          ),
        },
        {
          title: "Status",
          dataIndex: "status",
          key: "status",
          render: (status: string) => (
            <StatusBadge tone={payrollStatusTone(status)}>
              {payrollStatusLabel(status)}
            </StatusBadge>
          ),
        },
        {
          title: "Actions",
          key: "action",
          align: "right" as const,
          width: 72,
          render: (_: unknown, record: PayrollRunWithPayslips) =>
            record.status === "DRAFT" ? (
              <TableActionButton
                icon={CheckCircle}
                label={`Approve payroll for ${formatPayrollPeriod(record.month, record.year)}`}
                iconOnly
                onClick={() => onApprove(record)}
                className={tableActionAccentClassName("emerald")}
              />
            ) : null,
        },
      ] as ColumnsType<PayrollRunWithPayslips>,
    [onApprove],
  );

  return (
    <DataTable
      {...hubListDataTableProps({ pageSize: 10 })}
      loading={isLoading}
      columns={columns}
      dataSource={payrollRuns}
      rowKey="id"
      expandable={{
        expandedRowRender: (record: PayrollRun) => (
          <PayrollPayslipPanel
            payslips={filterPayslipsForEmployee(record.payslips, employeeId)}
            employeeId={employeeId}
            employeeName={employeeName}
          />
        ),
        defaultExpandedRowKeys,
        rowExpandable: (record) =>
          employeeId == null ||
          filterPayslipsForEmployee(record.payslips, employeeId).length > 0,
      }}
      emptyDescription={
        hasActiveFilters
          ? "No payroll runs match the current filters."
          : hasCurrentMonthRun
            ? "No payroll runs to display."
            : `Generate payroll for ${currentPeriodLabel} to get started.`
      }
    />
  );
}
