"use client";

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import { Table } from "antd";
import { DataTable } from "@/components/shared/data-table";
import { ListMobileCard } from "@/components/shared/responsive-data-table";
import type { Payslip } from "@/types/api";
import { formatCurrency } from "@/lib/money";
import { antTableSummaryRowClassName } from "@/lib/theme/data-table";
import { tableCellMutedClassName } from "@/lib/theme/feedback";
import {
  payrollDeductionClassName,
  payrollExpandedPanelClassName,
  payrollNetPayClassName,
  payrollOtMetricClassName,
  payrollSummaryRowClassName,
} from "@/lib/theme/hub-hr";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";

type PayrollPayslipPanelProps = {
  payslips: Payslip[];
  employeeId: number | null;
  employeeName?: string | null;
};

function PayslipTotals({ payslips }: { payslips: readonly Payslip[] }) {
  let totalGross = 0;
  let totalSso = 0;
  let totalTax = 0;
  let totalNet = 0;

  payslips.forEach((row) => {
    totalGross += Number(row.grossPay ?? 0);
    totalSso += Number(row.socialSecurity ?? 0);
    totalTax += Number(row.taxDeduction ?? 0);
    totalNet += Number(row.netPay ?? 0);
  });

  return (
    <div className="space-y-1 rounded-lg border border-[var(--table-row-border)] bg-[var(--table-summary-bg)] px-3 py-2 text-sm">
      <div className="flex justify-between gap-3">
        <span className={cn("font-medium", text.primary)}>Total gross</span>
        <span className={cn("tabular-nums font-medium", text.primary)}>
          {formatCurrency(totalGross)}
        </span>
      </div>
      <div className="flex justify-between gap-3">
        <span className={text.muted}>SSO</span>
        <span className={payrollDeductionClassName()}>-{formatCurrency(totalSso)}</span>
      </div>
      <div className="flex justify-between gap-3">
        <span className={text.muted}>Tax</span>
        <span className={payrollDeductionClassName()}>-{formatCurrency(totalTax)}</span>
      </div>
      <div className="flex justify-between gap-3 border-t border-[var(--table-row-border)] pt-1">
        <span className={cn("font-medium", text.primary)}>Net pay</span>
        <span className={payrollNetPayClassName()}>{formatCurrency(totalNet)}</span>
      </div>
    </div>
  );
}

export function PayrollPayslipPanel({
  payslips,
  employeeId,
  employeeName,
}: PayrollPayslipPanelProps) {
  const columns = useMemo(
    () =>
      [
        {
          title: "Employee",
          dataIndex: ["user", "name"],
          key: "name",
          width: 180,
          render: (name: string, record: Payslip) => (
            <div className="min-w-0">
              <div className={cn("truncate font-medium", text.primary)}>
                {name ?? `Employee #${record.userId}`}
              </div>
              {record.user?.email && (
                <div className={cn("truncate text-xs", tableCellMutedClassName())}>
                  {record.user.email}
                </div>
              )}
            </div>
          ),
        },
        {
          title: "Std",
          dataIndex: "standardHours",
          key: "std",
          width: 72,
          align: "right" as const,
          render: (val: number) => (
            <span className={cn("tabular-nums", text.muted)}>{val.toFixed(1)}</span>
          ),
        },
        {
          title: "OT",
          dataIndex: "otHours",
          key: "ot",
          width: 72,
          align: "right" as const,
          render: (val: number) => (
            <span className={payrollOtMetricClassName()}>{val.toFixed(1)}</span>
          ),
        },
        {
          title: "Gross",
          dataIndex: "grossPay",
          key: "grossPay",
          width: 100,
          align: "right" as const,
          render: (val: number) => (
            <span className={cn("tabular-nums", text.primary)}>{formatCurrency(val)}</span>
          ),
        },
        {
          title: "SSO",
          dataIndex: "socialSecurity",
          key: "sso",
          width: 100,
          align: "right" as const,
          render: (val: number) => (
            <span className={payrollDeductionClassName()}>-{formatCurrency(val)}</span>
          ),
        },
        {
          title: "Tax",
          dataIndex: "taxDeduction",
          key: "tax",
          width: 100,
          align: "right" as const,
          render: (val: number) => (
            <span className={payrollDeductionClassName()}>-{formatCurrency(val)}</span>
          ),
        },
        {
          title: "Net",
          dataIndex: "netPay",
          key: "netPay",
          width: 120,
          align: "right" as const,
          render: (val: number) => (
            <span className={payrollNetPayClassName()}>{formatCurrency(val)}</span>
          ),
        },
      ] as ColumnsType<Payslip>,
    [],
  );

  if (employeeId != null && payslips.length === 0) {
    return (
      <div className={payrollExpandedPanelClassName()}>
        <p className={text.muted}>
          No payslip for {employeeName ?? `employee #${employeeId}`} in this run.
        </p>
      </div>
    );
  }

  return (
    <div className={payrollExpandedPanelClassName()}>
      <div className="min-w-0 space-y-2 md:hidden">
        {payslips.map((record) => (
          <ListMobileCard key={record.id}>
            <p className={cn("font-medium", text.primary)}>
              {record.user?.name ?? `Employee #${record.userId}`}
            </p>
            {record.user?.email ? (
              <p className={cn("mb-2 truncate text-xs", tableCellMutedClassName())}>
                {record.user.email}
              </p>
            ) : null}
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              <div>
                <dt className={text.muted}>Std hrs</dt>
                <dd className={cn("tabular-nums", text.secondary)}>
                  {record.standardHours.toFixed(1)}
                </dd>
              </div>
              <div>
                <dt className={text.muted}>OT hrs</dt>
                <dd className={payrollOtMetricClassName()}>{record.otHours.toFixed(1)}</dd>
              </div>
              <div>
                <dt className={text.muted}>Gross</dt>
                <dd className={cn("tabular-nums", text.primary)}>
                  {formatCurrency(record.grossPay)}
                </dd>
              </div>
              <div>
                <dt className={text.muted}>Net</dt>
                <dd className={payrollNetPayClassName()}>{formatCurrency(record.netPay)}</dd>
              </div>
              <div>
                <dt className={text.muted}>SSO</dt>
                <dd className={payrollDeductionClassName()}>
                  -{formatCurrency(record.socialSecurity)}
                </dd>
              </div>
              <div>
                <dt className={text.muted}>Tax</dt>
                <dd className={payrollDeductionClassName()}>
                  -{formatCurrency(record.taxDeduction)}
                </dd>
              </div>
            </dl>
          </ListMobileCard>
        ))}
        {payslips.length > 1 ? <PayslipTotals payslips={payslips} /> : null}
      </div>

      <div className="hidden md:block">
        <DataTable
          columns={columns}
          dataSource={payslips}
          rowKey="id"
          pagination={false}
          size="small"
          hideBorders
          summary={(pageData: readonly Payslip[]) => {
            let totalGross = 0;
            let totalSso = 0;
            let totalTax = 0;
            let totalNet = 0;

            pageData.forEach((row) => {
              totalGross += Number(row.grossPay ?? 0);
              totalSso += Number(row.socialSecurity ?? 0);
              totalTax += Number(row.taxDeduction ?? 0);
              totalNet += Number(row.netPay ?? 0);
            });

            return (
              <Table.Summary.Row className={antTableSummaryRowClassName(payrollSummaryRowClassName())}>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <span className={cn("font-medium", text.primary)}>Total</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <span className={cn("tabular-nums font-medium", text.primary)}>
                    {formatCurrency(totalGross)}
                  </span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right">
                  <span className={payrollDeductionClassName()}>-{formatCurrency(totalSso)}</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  <span className={payrollDeductionClassName()}>-{formatCurrency(totalTax)}</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right">
                  <span className={payrollNetPayClassName()}>{formatCurrency(totalNet)}</span>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </div>
    </div>
  );
}
