"use client";

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import { CheckCircle } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import {
  ListMobileCard,
  PaginatedMobileList,
  ResponsiveDataTableLayout,
} from "@/components/shared/responsive-data-table";
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
} from "@/lib/filters/payroll-filters";
import { formatCurrency } from "@/lib/money";
import { useHubListPagination } from "@/hooks/useHubListPagination";
import { tableActionAccentClassName } from "@/lib/theme/hub-primitives";
import { text } from "@/lib/theme/surface";
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
  const emptyDescription = hasActiveFilters
    ? "No payroll runs match the current filters."
    : hasCurrentMonthRun
      ? "No payroll runs to display."
      : `Generate payroll for ${currentPeriodLabel} to get started.`;

  const listPagination = useHubListPagination(
    { pageSize: 10 },
    `${payrollRuns.length}-${hasActiveFilters}`,
  );

  const columns = useMemo(
    () =>
      [
        {
          title: "Period",
          key: "period",
          render: (_: unknown, record: PayrollRunWithPayslips) => (
            <span className={cn("font-medium", text.primary)}>
              {formatPayrollPeriod(record.month, record.year)}
            </span>
          ),
        },
        {
          title: "Payslips",
          key: "payslips",
          width: 96,
          responsive: ["md"],
          render: (_: unknown, record: PayrollRunWithPayslips) => (
            <span className={cn("tabular-nums", text.secondary)}>
              {payrollRunPayslipCount(record)}
            </span>
          ),
        },
        {
          title: "Net",
          key: "totalAmount",
          align: "right" as const,
          render: (_: unknown, record: PayrollRunWithPayslips) => (
            <span className={cn("tabular-nums font-medium", text.primary)}>
              {formatCurrency(payrollRunTotalNet(record))}
            </span>
          ),
        },
        {
          title: "Status",
          dataIndex: "status",
          key: "status",
          render: (status: string) => (
            <StatusBadge tone={payrollStatusTone(status)}>{payrollStatusLabel(status)}</StatusBadge>
          ),
        },
        {
          title: "",
          key: "action",
          align: "right" as const,
          width: 56,
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
    <ResponsiveDataTableLayout
      mobile={
        isLoading ? (
          <ResponsiveDataTableLayout.Skeleton />
        ) : payrollRuns.length === 0 ? (
          <ResponsiveDataTableLayout.Empty message={emptyDescription} />
        ) : (
          <PaginatedMobileList
            items={payrollRuns}
            pageSize={listPagination.pageSize}
            page={listPagination.currentPage}
            onPageChange={listPagination.setCurrentPage}
          >
            {(record) => {
              const payslips = filterPayslipsForEmployee(record.payslips, employeeId);
              const showPayslips = employeeId == null || payslips.length > 0;

              return (
                <ListMobileCard>
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={cn("font-medium", text.primary)}>
                        {formatPayrollPeriod(record.month, record.year)}
                      </p>
                      <p className={cn("text-sm tabular-nums", text.muted)}>
                        {payrollRunPayslipCount(record)} payslip
                        {payrollRunPayslipCount(record) === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <StatusBadge tone={payrollStatusTone(record.status)}>
                        {payrollStatusLabel(record.status)}
                      </StatusBadge>
                      <span className={cn("font-medium tabular-nums", text.primary)}>
                        {formatCurrency(payrollRunTotalNet(record))}
                      </span>
                    </div>
                  </div>
                  {record.status === "DRAFT" && (
                    <div className="mb-2 flex justify-end">
                      <TableActionButton
                        icon={CheckCircle}
                        label={`Approve payroll for ${formatPayrollPeriod(record.month, record.year)}`}
                        tone="emerald"
                        onClick={() => onApprove(record)}
                        className={tableActionAccentClassName("emerald")}
                      />
                    </div>
                  )}
                  {showPayslips && payslips.length > 0 ? (
                    <PayrollPayslipPanel
                      payslips={payslips}
                      employeeId={employeeId}
                      employeeName={employeeName}
                    />
                  ) : null}
                </ListMobileCard>
              );
            }}
          </PaginatedMobileList>
        )
      }
      desktop={
        <DataTable
          hideBorders
          pagination={listPagination.tablePagination}
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
          emptyDescription={emptyDescription}
        />
      }
    />
  );
}
