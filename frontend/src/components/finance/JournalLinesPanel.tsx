"use client";

import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { JournalEntry, JournalLine } from "@/types/api";
import { formatBaht } from "@/lib/money";
import {
  antTableShellClassName,
  antTableSummaryRowClassName,
  ledgerCreditClassName,
  ledgerDebitClassName,
  payrollExpandedPanelClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

type JournalLinesPanelProps = {
  entry: JournalEntry;
};

export function JournalLinesPanel({ entry }: JournalLinesPanelProps) {
  const lines = entry.lines ?? [];

  const columns: ColumnsType<JournalLine> = [
    {
      title: "Account code",
      dataIndex: ["account", "code"],
      key: "code",
      render: (code: string) => (
        <span className={cn("font-mono font-bold", text.muted)}>{code ?? "—"}</span>
      ),
    },
    {
      title: "Account name",
      dataIndex: ["account", "name"],
      key: "name",
      render: (name: string) => (
        <span className={cn("font-semibold", text.secondary)}>{name ?? "—"}</span>
      ),
    },
    {
      title: "Line description",
      dataIndex: "description",
      key: "desc",
      render: (description: string | null | undefined) => (
        <span className={cn("italic", text.muted)}>{description?.trim() || "—"}</span>
      ),
    },
    {
      title: "Debit",
      dataIndex: "debit",
      key: "debit",
      align: "right",
      render: (val: number) =>
        val > 0 ? (
          <span className={cn("font-mono tabular-nums", ledgerDebitClassName())}>
            {formatBaht(val)}
          </span>
        ) : (
          <span className={text.muted}>—</span>
        ),
    },
    {
      title: "Credit",
      dataIndex: "credit",
      key: "credit",
      align: "right",
      render: (val: number) =>
        val > 0 ? (
          <span className={cn("font-mono tabular-nums", ledgerCreditClassName())}>
            {formatBaht(val)}
          </span>
        ) : (
          <span className={text.muted}>—</span>
        ),
    },
  ];

  if (lines.length === 0) {
    return (
      <div className={payrollExpandedPanelClassName()}>
        <p className={text.muted}>No journal lines recorded for this entry.</p>
      </div>
    );
  }

  return (
    <div className={payrollExpandedPanelClassName()}>
      <Table
        columns={columns}
        dataSource={lines}
        pagination={false}
        rowKey="id"
        size="small"
        className={antTableShellClassName()}
        summary={(pageData: readonly JournalLine[]) => {
          let totalDebit = 0;
          let totalCredit = 0;

          pageData.forEach(({ debit, credit }) => {
            totalDebit += debit ?? 0;
            totalCredit += credit ?? 0;
          });

          return (
            <Table.Summary.Row className={antTableSummaryRowClassName()}>
              <Table.Summary.Cell index={0} colSpan={3}>
                <span className={cn("font-bold", text.primary)}>Total</span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <span className={cn("font-mono tabular-nums", ledgerDebitClassName())}>
                  {formatBaht(totalDebit)}
                </span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="right">
                <span className={cn("font-mono tabular-nums", ledgerCreditClassName())}>
                  {formatBaht(totalCredit)}
                </span>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    </div>
  );
}
