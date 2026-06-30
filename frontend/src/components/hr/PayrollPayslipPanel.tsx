"use client";

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import { Table } from "antd";
import Link from "next/link";
import { DataTable } from "@/components/shared/data-table";
import type { Payslip } from "@/types/api";
import { formatCurrency } from "@/lib/money";
import { antTableSummaryRowClassName } from "@/lib/theme/data-table";
import { tableCellMutedClassName } from "@/lib/theme/feedback";
import { payrollDeductionClassName, payrollExpandedPanelClassName, payrollNetPayClassName, payrollOtMetricClassName } from "@/lib/theme/hub-hr";
import { inlineLinkClassName } from "@/lib/theme/hub-primitives";
import { text } from "@/lib/theme/surface";
import { typeUiLabelClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";

type PayrollPayslipPanelProps = {
  payslips: Payslip[];
  employeeId: number | null;
  employeeName?: string | null;
};

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
          fixed: "left" as const,
          width: 200,
          render: (name: string, record: Payslip) => (
            <div className="min-w-0">
              <div className={cn("font-medium truncate", text.primary)}>
                {name ?? `Employee #${record.userId}`}
              </div>
              {record.user?.email && (
                <div className={cn("text-xs truncate", tableCellMutedClassName())}>
                  {record.user.email}
                </div>
              )}
            </div>
          ),
        },
        {
          title: "Std hrs",
          dataIndex: "standardHours",
          key: "std",
          width: 96,
          align: "right" as const,
          render: (val: number) => (
            <span className={cn("font-mono tabular-nums", text.muted)}>{val.toFixed(1)}</span>
          ),
        },
        {
          title: "OT hrs",
          dataIndex: "otHours",
          key: "ot",
          width: 96,
          align: "right" as const,
          render: (val: number) => (
            <span className={payrollOtMetricClassName()}>{val.toFixed(1)}</span>
          ),
        },
        {
          title: "Base pay",
          dataIndex: "basePay",
          key: "basePay",
          width: 120,
          align: "right" as const,
          render: (val: number) => (
            <span className="font-mono tabular-nums">{formatCurrency(val)}</span>
          ),
        },
        {
          title: "OT pay",
          dataIndex: "otPay",
          key: "otPay",
          width: 120,
          align: "right" as const,
          render: (val: number) => (
            <span className={payrollOtMetricClassName()}>{formatCurrency(val)}</span>
          ),
        },
        {
          title: "Gross",
          dataIndex: "grossPay",
          key: "grossPay",
          width: 120,
          align: "right" as const,
          render: (val: number) => (
            <span className={typeUiLabelClassName(cn("font-mono tabular-nums", text.primary))}>
              {formatCurrency(val)}
            </span>
          ),
        },
        {
          title: "SSO (5%)",
          dataIndex: "socialSecurity",
          key: "sso",
          width: 120,
          align: "right" as const,
          render: (val: number) => (
            <span className={payrollDeductionClassName()}>-{formatCurrency(val)}</span>
          ),
        },
        {
          title: "Tax (3%)",
          dataIndex: "taxDeduction",
          key: "tax",
          width: 120,
          align: "right" as const,
          render: (val: number) => (
            <span className={payrollDeductionClassName()}>-{formatCurrency(val)}</span>
          ),
        },
        {
          title: "Net pay",
          dataIndex: "netPay",
          key: "netPay",
          fixed: "right" as const,
          width: 140,
          align: "right" as const,
          render: (val: number) => (
            <span className={typeUiLabelClassName(payrollNetPayClassName())}>
              {formatCurrency(val)}
            </span>
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
        <Link href="/hr/employees" className={cn("text-sm", inlineLinkClassName())}>
          Back to employee directory
        </Link>
      </div>
    );
  }

  return (
    <div className={payrollExpandedPanelClassName()}>
      <DataTable
        columns={columns}
        dataSource={payslips}
        rowKey="id"
        pagination={false}
        size="small"
        scroll={{ x: 1200 }}
        hideBorders
        summary={(pageData: readonly Payslip[]) => {
          let totalGross = 0;
          let totalSso = 0;
          let totalTax = 0;
          let totalNet = 0;

          pageData.forEach((row) => {
            totalGross += row.grossPay ?? 0;
            totalSso += row.socialSecurity ?? 0;
            totalTax += row.taxDeduction ?? 0;
            totalNet += row.netPay ?? 0;
          });

          return (
            <Table.Summary.Row className={antTableSummaryRowClassName()}>
              <Table.Summary.Cell index={0} colSpan={5}>
                <span className={typeUiLabelClassName(text.primary)}>Total</span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <span className={typeUiLabelClassName(cn("font-mono tabular-nums", text.primary))}>
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
                <span className={typeUiLabelClassName(payrollNetPayClassName())}>
                  {formatCurrency(totalNet)}
                </span>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    </div>
  );
}
