"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { ColumnsType } from "antd/es/table";
import { seedAccounts } from "@/lib/api";
import { BookOpen, FileText, Landmark, Loader2, Play, Wallet } from "lucide-react";
import { toast } from "sonner";
import { HubPageHeader } from "@/components/shared/hub-card";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { QueryErrorBanner } from "@/components/shared/query-error-banner";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FinanceHubLinks } from "@/components/finance/FinanceHubLinks";
import { JournalLinesPanel } from "@/components/finance/JournalLinesPanel";
import { getErrorMessage } from "@/lib/errors";
import { StatusBadge, journalStatusTone } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/intl-date";
import { formatBaht } from "@/lib/money";
import type { Branch, JournalEntry } from "@/types/api";
import { useAuth } from "@/context/AuthContext";
import { useBranches } from "@/hooks/domains/useGeneralQueries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useJournalEntries, useLedger } from "@/hooks/domains/useAccountingQueries";
import {
  type JournalStatusFilter,
  type LedgerChartPoint,
  filterJournalEntries,
  journalStatusLabel,
  summarizeJournalEntries,
  summarizeLedgerChart,
} from "@/lib/ledger-filters";
import {
  financeHubIconClassName,
  financeMetricIconClassName,
  financeSectionPanelClassName,
  financeSectionTitleClassName,
  financeSummaryChipClassName,
  formSelectContentClassName,
  hubCtaClassName,
  hubLoadingSpinnerClassName,
  infoBannerClassName,
  infoBannerIconClassName,
  infoBannerTextClassName,
  infoBannerTitleClassName,
  inlineLinkClassName,
  inventorySummaryStripClassName,
  journalLegendSwatchClassName,
  listToolbarFieldClassName,
  metricValueClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

const LedgerTrendChart = dynamic(
  () => import("@/components/finance/LedgerTrendChart").then((module) => module.LedgerTrendChart),
  { ssr: false },
);

export default function GeneralLedgerPage() {
  const { activeBranchId } = useAuth();
  const { data: branches = [] } = useBranches();
  const branchIdNum = activeBranchId ? Number(activeBranchId) : undefined;
  const branchName = (branches as Branch[]).find((b) => b.id === branchIdNum)?.name;
  const showAllBranches = !branchIdNum;
  const selectedBranch = activeBranchId ? String(activeBranchId) : "ALL";

  const [isSeeding, setIsSeeding] = useState(false);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<JournalStatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase(), 300);

  const {
    data: chartData = [],
    isLoading: isChartLoading,
    isError: chartError,
    error: chartErr,
    refetch: refetchChart,
    isFetching: chartFetching,
  } = useLedger(selectedBranch);
  const {
    data: entries = [],
    isLoading: isEntriesLoading,
    isError: entriesError,
    error: entriesErr,
    refetch: refetchEntries,
    isFetching: entriesFetching,
  } = useJournalEntries(selectedBranch);

  const hasError = chartError || entriesError;
  const isFetching = chartFetching || entriesFetching;
  const errorMessage = getErrorMessage(chartErr ?? entriesErr, "Failed to load ledger data");

  const chartSummary = useMemo(
    () => summarizeLedgerChart(chartData as LedgerChartPoint[]),
    [chartData],
  );
  const entrySummary = useMemo(() => summarizeJournalEntries(entries), [entries]);

  const filteredEntries = useMemo(
    () =>
      filterJournalEntries(entries, {
        statusFilter,
        search: debouncedSearch,
      }),
    [entries, statusFilter, debouncedSearch],
  );

  const hasActiveFilters = statusFilter !== "ALL" || search.trim().length > 0;
  const showSeedAction = entries.length === 0 && !isEntriesLoading && !entriesError;

  const handleSeed = async () => {
    try {
      setIsSeeding(true);
      await seedAccounts();
      toast.success("Chart of accounts seeded");
      setShowSeedConfirm(false);
      void refetchEntries();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to seed accounts"));
    } finally {
      setIsSeeding(false);
    }
  };

  const columns = useMemo(
    () =>
      [
        {
          title: "Date",
          dataIndex: "date",
          key: "date",
          render: (date: string) => (
            <span className={cn("font-medium", text.subtle)}>{formatDate(date)}</span>
          ),
        },
        {
          title: "Reference",
          dataIndex: "reference",
          key: "reference",
          render: (ref: string | null | undefined) => (
            <StatusBadge tone="info" className="font-mono">
              {ref || "—"}
            </StatusBadge>
          ),
        },
        {
          title: "Description",
          dataIndex: "description",
          key: "description",
          render: (description: string) => (
            <span className={cn("line-clamp-2", text.secondary)}>{description}</span>
          ),
        },
        {
          title: "Lines",
          key: "lines",
          responsive: ["md"],
          render: (_: unknown, record: JournalEntry) => (
            <span className={cn("tabular-nums text-sm", text.muted)}>
              {record.lines?.length ?? 0}
            </span>
          ),
        },
        {
          title: "Status",
          dataIndex: "status",
          key: "status",
          render: (status: string) => (
            <StatusBadge tone={journalStatusTone(status)}>
              {journalStatusLabel(status)}
            </StatusBadge>
          ),
        },
      ] as ColumnsType<JournalEntry>,
    [],
  );

  return (
    <div className="space-y-6">
      <HubPageHeader
        hideTitle
        icon={BookOpen}
        accentHub="finance"
        description="Profit and loss trends plus double-entry journal activity for the selected branch scope."
        actions={
          <FinanceHubLinks current="ledger">
            {showSeedAction && (
              <Button
                className={hubCtaClassName("finance", "font-bold")}
                disabled={isSeeding}
                onClick={() => setShowSeedConfirm(true)}
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin motion-reduce:animate-none" aria-hidden />
                    Seeding…
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" aria-hidden />
                    Seed accounts
                  </>
                )}
              </Button>
            )}
          </FinanceHubLinks>
        }
      />

      <div className={financeSectionPanelClassName("space-y-4")}>
        {showSeedAction && (
          <div className={infoBannerClassName()}>
            <div className="flex items-start gap-3">
              <Landmark className={infoBannerIconClassName()} aria-hidden />
              <div>
                <p className={infoBannerTitleClassName()}>Chart of accounts not initialized</p>
                <p className={infoBannerTextClassName()}>
                  Seed standard accounting codes to start posting journal entries, or review the{" "}
                  <Link href="/finance/accounts" className={inlineLinkClassName()}>
                    chart of accounts
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        )}

        {!isChartLoading && !isEntriesLoading && !hasError && (
          <div
            className={inventorySummaryStripClassName()}
            aria-live="polite"
            aria-atomic="true"
          >
            <span className={cn("font-semibold tabular-nums", text.primary)}>
              {entrySummary.total > 0
                ? `${entrySummary.total} journal entr${entrySummary.total === 1 ? "y" : "ies"}`
                : "No journal entries yet"}
            </span>
            {entrySummary.posted > 0 && (
              <button
                type="button"
                className={financeSummaryChipClassName(
                  statusFilter === "POSTED",
                  metricValueClassName("emerald"),
                )}
                onClick={() =>
                  setStatusFilter((current) => (current === "POSTED" ? "ALL" : "POSTED"))
                }
              >
                {entrySummary.posted} posted
              </button>
            )}
            {entrySummary.draft > 0 && (
              <button
                type="button"
                className={financeSummaryChipClassName(
                  statusFilter === "DRAFT",
                  metricValueClassName("amber"),
                )}
                onClick={() =>
                  setStatusFilter((current) => (current === "DRAFT" ? "ALL" : "DRAFT"))
                }
              >
                {entrySummary.draft} draft
              </button>
            )}
            {chartSummary.months > 0 && (
              <>
                <span className={cn("tabular-nums font-medium", metricValueClassName("emerald"))}>
                  {formatBaht(chartSummary.totalRevenue)} revenue
                </span>
                <span className={cn("tabular-nums font-medium", metricValueClassName("red"))}>
                  {formatBaht(chartSummary.totalExpense)} expenses
                </span>
              </>
            )}
            {isFetching && (
              <span className={cn("inline-flex items-center gap-1.5", text.muted)}>
                <Loader2
                  className={cn(hubLoadingSpinnerClassName(), "w-3.5 h-3.5")}
                  aria-hidden
                />
                Updating…
              </span>
            )}
          </div>
        )}

        {!isChartLoading && !isEntriesLoading && !hasError && (
          <div
            className={cn(
              "flex flex-wrap items-center gap-x-4 gap-y-2 text-xs",
              "pb-3 border-b border-[var(--table-row-border)]",
            )}
            aria-label="Journal status legend"
          >
            {(
              [
                ["DRAFT", "Draft"],
                ["POSTED", "Posted"],
              ] as const
            ).map(([status, label]) => (
              <span
                key={status}
                className={cn("inline-flex items-center gap-1.5 font-medium", text.secondary)}
              >
                <span className={journalLegendSwatchClassName(status)} aria-hidden />
                {label}
              </span>
            ))}
            <Link
              href="/finance/overview"
              className={cn("inline-flex items-center gap-1 font-medium", inlineLinkClassName())}
            >
              <Wallet className="w-3.5 h-3.5" aria-hidden />
              Finance overview
            </Link>
          </div>
        )}

        {hasError && (
          <QueryErrorBanner
            message={errorMessage}
            onRetry={() => {
              void refetchChart();
              void refetchEntries();
            }}
            loading={isFetching}
          />
        )}

        <ListToolbar
          branchName={branchName}
          allBranches={showAllBranches}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search reference, description, account…"
          showReset={hasActiveFilters}
          onReset={() => {
            setStatusFilter("ALL");
            setSearch("");
          }}
          filters={
            <Select
              value={statusFilter}
              onValueChange={(value) => value && setStatusFilter(value as JournalStatusFilter)}
            >
              <SelectTrigger
                className={listToolbarFieldClassName("min-h-[44px] w-full sm:w-[180px]")}
                aria-label="Filter journal entries by status"
              >
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent className={formSelectContentClassName()}>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="POSTED">Posted</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
              </SelectContent>
            </Select>
          }
        />

        <div className={financeSectionPanelClassName("border border-[var(--table-container-border)] bg-[var(--table-container-bg)]")}>
          <h2 className={financeSectionTitleClassName("mb-4")}>
            <BookOpen className={financeHubIconClassName()} aria-hidden />
            Profit &amp; loss trend
          </h2>
          <LedgerTrendChart data={chartData as LedgerChartPoint[]} loading={isChartLoading} />
        </div>

        <div className={financeSectionPanelClassName("border border-[var(--table-container-border)] bg-[var(--table-container-bg)]")}>
          <h2 className={financeSectionTitleClassName()}>
            <FileText className={financeMetricIconClassName("indigo")} aria-hidden />
            Journal entries
          </h2>
          <DataTable
            columns={columns}
            dataSource={filteredEntries}
            rowKey="id"
            loading={isEntriesLoading}
            expandable={{
              expandedRowRender: (record: JournalEntry) => <JournalLinesPanel entry={record} />,
              rowExpandable: (record) => (record.lines?.length ?? 0) > 0,
            }}
            pagination={{ pageSize: 20 }}
            emptyDescription={
              hasActiveFilters
                ? "No journal entries match the current filters."
                : showSeedAction
                  ? "Seed the chart of accounts to begin posting journal entries."
                  : "No journal entries found for this branch scope."
            }
          />
        </div>
      </div>

      <ConfirmDialog
        open={showSeedConfirm}
        onOpenChange={setShowSeedConfirm}
        title="Initialize chart of accounts?"
        description="This seeds standard accounting codes required for journal posting. Existing accounts are not removed."
        confirmLabel="Seed accounts"
        loading={isSeeding}
        onConfirm={handleSeed}
      />
    </div>
  );
}
