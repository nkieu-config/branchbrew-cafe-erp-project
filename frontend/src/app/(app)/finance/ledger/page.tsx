"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { seedAccounts } from "@/lib/api"
import { Table, Spin } from "antd"
import { FileText, Play } from "lucide-react"
import { toast } from "sonner"
import { HubPageHeader } from "@/components/shared/hub-card"
import { QueryErrorBanner } from "@/components/shared/query-error-banner"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { dataTableEmptyTextClassName } from "@/lib/theme"
import { getErrorMessage } from "@/lib/errors"
import { StatusBadge, journalStatusTone } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/intl-date"
import type { JournalEntry } from "@/types/api"
import {
  antTableShellClassName,
  antTableSummaryRowClassName,
  dataTableContainerClassName,
  financeMetricIconClassName,
  hubInfoActionClassName,
  ledgerCreditClassName,
  ledgerDebitClassName,
  ledgerPanelClassName,
  text,
} from "@/lib/theme"

import { useAuth } from "@/context/AuthContext"
import { useLedger, useJournalEntries } from '@/hooks/domains/useAccountingQueries';

const LedgerTrendChart = dynamic(
  () => import("@/components/finance/LedgerTrendChart").then((m) => m.LedgerTrendChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <Spin size="large" />
      </div>
    ),
  },
);

export default function GeneralLedgerPage() {
  const { activeBranchId } = useAuth()
  const selectedBranch = activeBranchId ? String(activeBranchId) : "ALL"
  const [isSeeding, setIsSeeding] = useState(false)
  const [showSeedConfirm, setShowSeedConfirm] = useState(false)

  const { data: chartData = [], isLoading: isChartLoading, isError: chartError, error: chartErr, refetch: refetchChart } = useLedger(selectedBranch)
  const { data: entries = [], isLoading: isEntriesLoading, isError: entriesError, error: entriesErr, refetch: refetchEntries } = useJournalEntries(selectedBranch)
  const loading = isChartLoading || isEntriesLoading;
  const hasError = chartError || entriesError;
  const errorMessage = getErrorMessage(chartErr ?? entriesErr, "Failed to load ledger data");

  const handleSeed = async () => {
    try {
      setIsSeeding(true);
      await seedAccounts();
      toast.success("Accounts seeded successfully");
      refetchEntries();
    } catch (err) {
      toast.error("Failed to seed accounts");
    } finally {
      setIsSeeding(false);
    }
  }

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => <span className={`font-medium ${text.subtle}`}>{formatDate(date)}</span>,
    },
    {
      title: 'Reference',
      dataIndex: 'reference',
      key: 'reference',
      render: (ref: string) => (
        <StatusBadge tone="info" className="font-mono">{ref || "-"}</StatusBadge>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => <span className={text.secondary}>{desc}</span>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <StatusBadge tone={journalStatusTone(status)} className="font-bold">{status}</StatusBadge>
      ),
    },
  ]

  const expandedRowRender = (record: JournalEntry) => {
    const lineColumns = [
      { title: 'Account Code', dataIndex: ['account', 'code'], key: 'code', render: (textVal: string) => <span className={`font-mono font-bold ${text.muted}`}>{textVal}</span> },
      { title: 'Account Name', dataIndex: ['account', 'name'], key: 'name', render: (textVal: string) => <span className={`font-semibold ${text.secondary}`}>{textVal}</span> },
      { title: 'Description', dataIndex: 'description', key: 'desc', render: (textVal: string) => <span className={`italic ${text.muted}`}>{textVal || '-'}</span> },
      { 
        title: 'Debit (THB)', 
        dataIndex: 'debit', 
        key: 'debit',
        render: (val: number) => val > 0 ? <span className={ledgerDebitClassName()}>{val.toLocaleString('en-US', {minimumFractionDigits: 2})}</span> : '-',
        align: 'right' as const,
      },
      { 
        title: 'Credit (THB)', 
        dataIndex: 'credit', 
        key: 'credit',
        render: (val: number) => val > 0 ? <span className={ledgerCreditClassName()}>{val.toLocaleString('en-US', {minimumFractionDigits: 2})}</span> : '-',
        align: 'right' as const,
      },
    ]

    return (
      <Table 
        columns={lineColumns} 
        dataSource={record.lines || []} 
        pagination={false} 
        rowKey="id" 
        size="small" 
        className={antTableShellClassName()}
        summary={(pageData: readonly { debit?: number; credit?: number }[]) => {
          let totalDebit = 0;
          let totalCredit = 0;

          pageData.forEach(({ debit, credit }) => {
            totalDebit += debit || 0;
            totalCredit += credit || 0;
          });

          return (
            <Table.Summary.Row className={antTableSummaryRowClassName()}>
              <Table.Summary.Cell index={0} colSpan={3}>Total</Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <span className={ledgerDebitClassName()}>{totalDebit.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="right">
                <span className={ledgerCreditClassName()}>{totalCredit.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <HubPageHeader
        hideTitle
        description="Profit & loss trends and journal entries."
        actions={
          entries.length === 0 && !loading ? (
            <Button
              className={hubInfoActionClassName()}
              disabled={isSeeding}
              onClick={() => setShowSeedConfirm(true)}
            >
              <Play className="w-4 h-4 mr-2" />
              Seed Accounts
            </Button>
          ) : null
        }
      />

      {hasError && (
        <QueryErrorBanner
          message={errorMessage}
          onRetry={() => {
            void refetchChart();
            void refetchEntries();
          }}
        />
      )}

      <div className={ledgerPanelClassName("mb-6")}>
        <h2 className={`text-lg font-black mb-6 flex items-center gap-2 ${text.primary}`}>
          Profit & Loss Trend
        </h2>
        <div className="h-[350px] w-full">
          {isChartLoading ? (
             <div className="flex h-full items-center justify-center">
               <Spin size="large" />
             </div>
          ) : (
            <LedgerTrendChart data={chartData} />
          )}
        </div>
      </div>

      <div className={ledgerPanelClassName("pt-2")}>
        <h2 className={`font-semibold text-lg mb-4 flex items-center gap-2 ${text.primary}`}>
          <FileText className={financeMetricIconClassName("indigo")} /> General Ledger (Journal Entries)
        </h2>
        <div className={dataTableContainerClassName()}>
        <Table 
          columns={columns} 
          dataSource={entries} 
          rowKey="id"
          loading={isEntriesLoading}
          expandable={{ expandedRowRender }}
          pagination={{ pageSize: 20 }}
          locale={{ emptyText: <span className={dataTableEmptyTextClassName()}>No journal entries found.</span> }}
        />
        </div>
      </div>

      <ConfirmDialog
        open={showSeedConfirm}
        onOpenChange={setShowSeedConfirm}
        title="Initialize Chart of Accounts?"
        description="This will seed standard accounting codes."
        confirmLabel="Seed"
        loading={isSeeding}
        onConfirm={handleSeed}
      />
    </div>
  )
}
