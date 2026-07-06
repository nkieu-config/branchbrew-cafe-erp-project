"use client";

import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { AntdProvider } from "@/providers/AntdProvider";
import { ListMobileCard } from "@/components/shared/responsive-data-table";
import type { JournalEntry, JournalLine } from "@/types/api";
import { formatCurrency } from "@/lib/money";
import {
  antTableShellClassName,
  antTableSummaryRowClassName,
  dataTableContainerClassName,
} from "@/lib/theme/data-table";
import { ledgerCreditClassName, ledgerDebitClassName } from "@/lib/theme/finance";
import { expandedRowPanelClassName } from "@/lib/theme/hub-primitives";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";

type JournalLinesPanelProps = {
  entry: JournalEntry;
};

function JournalLineTotals({ lines }: { lines: readonly JournalLine[] }) {
  let totalDebit = 0;
  let totalCredit = 0;

  lines.forEach(({ debit, credit }) => {
    totalDebit += debit ?? 0;
    totalCredit += credit ?? 0;
  });

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--table-row-border)] bg-[var(--table-summary-bg)] px-3 py-2 text-sm">
      <span className={cn("font-medium", text.primary)}>Total</span>
      <div className="flex gap-4 tabular-nums">
        <span className={ledgerDebitClassName()}>{formatCurrency(totalDebit)}</span>
        <span className={ledgerCreditClassName()}>{formatCurrency(totalCredit)}</span>
      </div>
    </div>
  );
}

export function JournalLinesPanel({ entry }: JournalLinesPanelProps) {
  const lines = entry.lines ?? [];

  const columns: ColumnsType<JournalLine> = [
    {
      title: "Code",
      dataIndex: ["account", "code"],
      key: "code",
      width: 88,
      render: (code: string) => (
        <span className={cn("font-mono text-sm", text.muted)}>{code ?? "—"}</span>
      ),
    },
    {
      title: "Account",
      dataIndex: ["account", "name"],
      key: "name",
      render: (name: string) => <span className={text.secondary}>{name ?? "—"}</span>,
    },
    {
      title: "Debit",
      dataIndex: "debit",
      key: "debit",
      align: "right",
      width: 110,
      render: (val: number) =>
        val > 0 ? (
          <span className={ledgerDebitClassName()}>{formatCurrency(val)}</span>
        ) : (
          <span className={text.muted}>—</span>
        ),
    },
    {
      title: "Credit",
      dataIndex: "credit",
      key: "credit",
      align: "right",
      width: 110,
      render: (val: number) =>
        val > 0 ? (
          <span className={ledgerCreditClassName()}>{formatCurrency(val)}</span>
        ) : (
          <span className={text.muted}>—</span>
        ),
    },
  ];

  if (lines.length === 0) {
    return (
      <div className={expandedRowPanelClassName()}>
        <p className={text.muted}>No lines for this entry.</p>
      </div>
    );
  }

  return (
    <AntdProvider>
    <div className={expandedRowPanelClassName()}>
      <div className="min-w-0 space-y-2 md:hidden">
        {lines.map((line) => (
          <ListMobileCard key={line.id}>
            <p className={cn("font-mono text-xs", text.muted)}>{line.account?.code ?? "—"}</p>
            <p className={cn("mb-2 font-medium", text.primary)}>{line.account?.name ?? "—"}</p>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className={text.muted}>Debit</dt>
                <dd className={ledgerDebitClassName()}>
                  {(line.debit ?? 0) > 0 ? formatCurrency(line.debit) : "—"}
                </dd>
              </div>
              <div>
                <dt className={text.muted}>Credit</dt>
                <dd className={ledgerCreditClassName()}>
                  {(line.credit ?? 0) > 0 ? formatCurrency(line.credit) : "—"}
                </dd>
              </div>
            </dl>
          </ListMobileCard>
        ))}
        <JournalLineTotals lines={lines} />
      </div>

      <div className="hidden md:block">
        <div className={dataTableContainerClassName({ hideBorders: true })}>
          <Table
            columns={columns}
            dataSource={lines}
            pagination={false}
            rowKey="id"
            size="small"
            className={antTableShellClassName("my-0 border-0 rounded-none")}
            summary={(pageData: readonly JournalLine[]) => {
              let totalDebit = 0;
              let totalCredit = 0;

              pageData.forEach(({ debit, credit }) => {
                totalDebit += debit ?? 0;
                totalCredit += credit ?? 0;
              });

              return (
                <Table.Summary.Row className={antTableSummaryRowClassName()}>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <span className={cn("font-medium", text.primary)}>Total</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <span className={ledgerDebitClassName()}>{formatCurrency(totalDebit)}</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">
                    <span className={ledgerCreditClassName()}>{formatCurrency(totalCredit)}</span>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              );
            }}
          />
        </div>
      </div>
    </div>
    </AntdProvider>
  );
}
