"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { HubPageHeader } from "@/components/shared/hub-card";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { QueryErrorBanner } from "@/components/shared/query-error-banner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TableActionButton } from "@/components/shared/table-action-button";
import { StatusBadge, settlementStatusTone } from "@/components/shared/status-badge";
import { FinanceHubLinks } from "@/components/finance/FinanceHubLinks";
import { exportSales } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  CheckCircle2,
  DollarSign,
  Download,
  Loader2,
  Wallet,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  useApproveSettlement,
  useFinanceExpenses,
  useFinanceSettlements,
} from "@/hooks/domains/useFinanceQueries";
import { useBranches } from "@/hooks/domains/useGeneralQueries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getErrorMessage } from "@/lib/errors";
import { formatDate, formatDateTime } from "@/lib/intl-date";
import { formatBaht } from "@/lib/money";
import type { Branch, Expense, Settlement } from "@/types/api";
import {
  type SettlementStatusFilter,
  filterExpenses,
  filterSettlements,
  settlementStatusLabel,
  summarizeFinanceOverview,
} from "@/lib/finance-overview-filters";
import {
  buildFinanceOverviewUrl,
  parseFinanceOverviewSearchParams,
} from "@/lib/finance-hub-url";
import {
  financeExpenseAmountClassName,
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
  listToolbarFieldClassName,
  metricValueClassName,
  nativeTableBodyClassName,
  nativeTableCellMutedClassName,
  nativeTableCellPrimaryClassName,
  nativeTableClassName,
  nativeTableEmptyCellClassName,
  nativeTableHeadClassName,
  nativeTableRowClassName,
  settlementDifferenceClassName,
  settlementLegendSwatchClassName,
  tableActionAccentClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

function FinanceTableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-2">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}

export default function FinanceDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, activeBranchId } = useAuth();
  const branchIdNum = activeBranchId ? Number(activeBranchId) : undefined;
  const { data: branches = [] } = useBranches();
  const branchName = (branches as Branch[]).find((b) => b.id === branchIdNum)?.name;
  const showAllBranches = !branchIdNum;

  const initialStatus = parseFinanceOverviewSearchParams(searchParams).statusFilter;

  const [settlementFilter, setSettlementFilter] = useState<SettlementStatusFilter>(initialStatus);
  const [expenseSearch, setExpenseSearch] = useState("");
  const debouncedExpenseSearch = useDebouncedValue(expenseSearch.trim().toLowerCase(), 300);
  const [approveTarget, setApproveTarget] = useState<Settlement | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setSettlementFilter(parseFinanceOverviewSearchParams(searchParams).statusFilter);
  }, [searchParams]);

  const {
    data: settlements = [],
    isLoading: loadingSettlements,
    isError: settlementsError,
    error: settlementsErr,
    refetch: refetchSettlements,
    isFetching: fetchingSettlements,
  } = useFinanceSettlements(branchIdNum);
  const {
    data: expenses = [],
    isLoading: loadingExpenses,
    isError: expensesError,
    error: expensesErr,
    refetch: refetchExpenses,
    isFetching: fetchingExpenses,
  } = useFinanceExpenses(branchIdNum);
  const approveSettlementMutation = useApproveSettlement();

  const hasError = settlementsError || expensesError;
  const isFetching = fetchingSettlements || fetchingExpenses;
  const errorMessage = getErrorMessage(
    settlementsErr ?? expensesErr,
    "Failed to load finance data",
  );

  const summary = useMemo(
    () => summarizeFinanceOverview(settlements, expenses),
    [settlements, expenses],
  );

  const visibleSettlements = useMemo(
    () => filterSettlements(settlements, settlementFilter),
    [settlements, settlementFilter],
  );

  const visibleExpenses = useMemo(
    () => filterExpenses(expenses, debouncedExpenseSearch),
    [expenses, debouncedExpenseSearch],
  );

  const hasActiveFilters =
    settlementFilter !== "ALL" || expenseSearch.trim().length > 0;

  const setSettlementFilterAndUrl = useCallback(
    (next: SettlementStatusFilter) => {
      setSettlementFilter(next);
      router.replace(
        buildFinanceOverviewUrl(next === "ALL" ? undefined : { status: next }),
        { scroll: false },
      );
    },
    [router],
  );

  const toggleSettlementFilter = (next: SettlementStatusFilter) => {
    setSettlementFilterAndUrl(settlementFilter === next ? "ALL" : next);
  };

  const handleApprove = async (id: number) => {
    try {
      await approveSettlementMutation.mutateAsync(id);
      toast.success("Settlement approved");
      setApproveTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to approve settlement"));
    }
  };

  const handleExport = async () => {
    if (!isAuthenticated) return;
    try {
      setIsExporting(true);
      toast.info("Exporting sales…");
      await exportSales(activeBranchId || undefined);
      toast.success("Export successful");
    } catch (error) {
      toast.error(getErrorMessage(error, "Export failed"));
    } finally {
      setIsExporting(false);
    }
  };

  const handleRetry = () => {
    void refetchSettlements();
    void refetchExpenses();
  };

  return (
    <div className="space-y-6">
      <HubPageHeader
        hideTitle
        icon={Wallet}
        accentHub="finance"
        description="Review end-of-day shift settlements and petty cash expenses before ledger posting."
        actions={
          <FinanceHubLinks current="overview">
            <Button
              onClick={() => void handleExport()}
              disabled={isExporting}
              className={hubCtaClassName("finance", "font-bold")}
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin motion-reduce:animate-none" aria-hidden />
                  Exporting…
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" aria-hidden />
                  Export sales (CSV)
                </>
              )}
            </Button>
          </FinanceHubLinks>
        }
      />

      <div className={financeSectionPanelClassName("space-y-4")}>
        {initialStatus === "PENDING" && summary.pending > 0 && (
          <div className={infoBannerClassName()}>
            <div className="flex items-start gap-3">
              <CheckCircle2 className={infoBannerIconClassName()} aria-hidden />
              <div>
                <p className={infoBannerTitleClassName()}>Settlements awaiting approval</p>
                <p className={infoBannerTextClassName()}>
                  {summary.pending} settlement{summary.pending === 1 ? "" : "s"}{" "}
                  {summary.pending === 1 ? "needs" : "need"} cash reconciliation review
                  {showAllBranches ? " across branches" : ` at ${branchName ?? "this branch"}`}.
                </p>
              </div>
            </div>
          </div>
        )}

        {!loadingSettlements && !loadingExpenses && !hasError && (
          <div
            className={inventorySummaryStripClassName()}
            aria-live="polite"
            aria-atomic="true"
          >
            <span className={cn("font-semibold tabular-nums", text.primary)}>
              {summary.settlements > 0 || summary.expenses > 0
                ? `${summary.settlements} settlement${summary.settlements === 1 ? "" : "s"} · ${summary.expenses} expense${summary.expenses === 1 ? "" : "s"}`
                : "No finance activity yet"}
            </span>
            {summary.pending > 0 && (
              <button
                type="button"
                className={financeSummaryChipClassName(
                  settlementFilter === "PENDING",
                  metricValueClassName("amber"),
                )}
                onClick={() => toggleSettlementFilter("PENDING")}
              >
                {summary.pending} pending
              </button>
            )}
            {summary.approved > 0 && (
              <button
                type="button"
                className={financeSummaryChipClassName(
                  settlementFilter === "APPROVED",
                  metricValueClassName("emerald"),
                )}
                onClick={() => toggleSettlementFilter("APPROVED")}
              >
                {summary.approved} approved
              </button>
            )}
            {summary.rejected > 0 && (
              <button
                type="button"
                className={financeSummaryChipClassName(
                  settlementFilter === "REJECTED",
                  metricValueClassName("red"),
                )}
                onClick={() => toggleSettlementFilter("REJECTED")}
              >
                {summary.rejected} rejected
              </button>
            )}
            {summary.totalExpenseAmount > 0 && (
              <span className={cn("tabular-nums font-medium", metricValueClassName("red"))}>
                -{formatBaht(summary.totalExpenseAmount)} expenses
              </span>
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

        {!loadingSettlements && !loadingExpenses && !hasError && (
          <div
            className={cn(
              "flex flex-wrap items-center gap-x-4 gap-y-2 text-xs",
              "pb-3 border-b border-[var(--table-row-border)]",
            )}
            aria-label="Settlement status legend"
          >
            {(
              [
                ["PENDING", "Pending"],
                ["APPROVED", "Approved"],
                ["REJECTED", "Rejected"],
              ] as const
            ).map(([status, label]) => (
              <span
                key={status}
                className={cn("inline-flex items-center gap-1.5 font-medium", text.secondary)}
              >
                <span className={settlementLegendSwatchClassName(status)} aria-hidden />
                {label}
              </span>
            ))}
            <Link
              href="/finance/ledger"
              className={cn("inline-flex items-center gap-1 font-medium", inlineLinkClassName())}
            >
              <BookOpen className="w-3.5 h-3.5" aria-hidden />
              General ledger
            </Link>
          </div>
        )}

        {hasError && (
          <QueryErrorBanner
            message={errorMessage}
            onRetry={handleRetry}
            loading={isFetching}
          />
        )}

        <ListToolbar
          branchName={branchName}
          allBranches={showAllBranches}
          search={expenseSearch}
          onSearchChange={setExpenseSearch}
          searchPlaceholder="Search expenses…"
          showReset={hasActiveFilters}
          onReset={() => {
            setSettlementFilterAndUrl("ALL");
            setExpenseSearch("");
          }}
          filters={
            <Select
              value={settlementFilter}
              onValueChange={(value) =>
                value && setSettlementFilterAndUrl(value as SettlementStatusFilter)
              }
            >
              <SelectTrigger
                className={listToolbarFieldClassName("min-h-[44px] w-full sm:w-[180px]")}
                aria-label="Filter settlements by status"
              >
                <SelectValue placeholder="All settlements" />
              </SelectTrigger>
              <SelectContent className={formSelectContentClassName()}>
                <SelectItem value="ALL">All settlements</SelectItem>
                <SelectItem value="PENDING">Pending approval</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={financeSectionPanelClassName("flex flex-col border border-[var(--table-container-border)] bg-[var(--table-container-bg)]")}>
            <h2 className={financeSectionTitleClassName("mb-4")}>
              <CheckCircle2 className={financeHubIconClassName()} aria-hidden />
              Shift settlements
            </h2>
            <div className="overflow-x-auto">
              {loadingSettlements ? (
                <FinanceTableSkeleton />
              ) : (
                <table className={nativeTableClassName()}>
                  <thead className={nativeTableHeadClassName()}>
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Date</th>
                      <th className="px-4 py-3">Branch</th>
                      <th className="px-4 py-3 text-right">Expected</th>
                      <th className="px-4 py-3 text-right">Actual</th>
                      <th className="px-4 py-3 text-right">Diff</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 rounded-r-lg text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className={nativeTableBodyClassName()}>
                    {visibleSettlements.map((settlement) => (
                      <tr key={settlement.id} className={nativeTableRowClassName()}>
                        <td className={nativeTableCellMutedClassName()}>
                          {formatDate(settlement.date)}
                        </td>
                        <td className={nativeTableCellPrimaryClassName()}>
                          {settlement.branch?.name ?? "Main"}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {formatBaht(settlement.expectedCash)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {formatBaht(settlement.actualCash)}
                        </td>
                        <td className={settlementDifferenceClassName(settlement.difference)}>
                          {settlement.difference === 0
                            ? formatBaht(0)
                            : `${settlement.difference > 0 ? "+" : "-"}${formatBaht(Math.abs(settlement.difference))}`}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge tone={settlementStatusTone(settlement.status)}>
                            {settlementStatusLabel(settlement.status)}
                          </StatusBadge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {settlement.status === "PENDING" && (
                            <TableActionButton
                              icon={CheckCircle2}
                              label={`Approve settlement for ${settlement.branch?.name ?? "branch"} on ${formatDate(settlement.date)}`}
                              iconOnly
                              onClick={() => setApproveTarget(settlement)}
                              className={tableActionAccentClassName("emerald")}
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                    {visibleSettlements.length === 0 && !loadingSettlements && (
                      <tr>
                        <td colSpan={7} className={nativeTableEmptyCellClassName()}>
                          {settlementFilter !== "ALL"
                            ? "No settlements match the current filter."
                            : "No shift settlements recorded yet."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className={financeSectionPanelClassName("flex flex-col border border-[var(--table-container-border)] bg-[var(--table-container-bg)]")}>
            <h2 className={financeSectionTitleClassName()}>
              <DollarSign className={financeMetricIconClassName("amber")} aria-hidden />
              Petty cash expenses
            </h2>
            <div className="overflow-x-auto">
              {loadingExpenses ? (
                <FinanceTableSkeleton />
              ) : (
                <table className={nativeTableClassName()}>
                  <thead className={nativeTableHeadClassName()}>
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Date</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 rounded-r-lg">By</th>
                    </tr>
                  </thead>
                  <tbody className={nativeTableBodyClassName()}>
                    {visibleExpenses.map((expense) => (
                      <tr key={expense.id} className={nativeTableRowClassName()}>
                        <td className={nativeTableCellMutedClassName()}>
                          {formatDateTime(expense.createdAt)}
                        </td>
                        <td className={nativeTableCellPrimaryClassName()}>{expense.category}</td>
                        <td className={nativeTableCellMutedClassName()}>
                          {expense.description?.trim() || "—"}
                        </td>
                        <td className={financeExpenseAmountClassName()}>
                          -{formatBaht(expense.amount)}
                        </td>
                        <td className={nativeTableCellMutedClassName()}>
                          {expense.recordedBy?.name ?? "—"}
                        </td>
                      </tr>
                    ))}
                    {visibleExpenses.length === 0 && !loadingExpenses && (
                      <tr>
                        <td colSpan={5} className={nativeTableEmptyCellClassName()}>
                          {expenseSearch.trim()
                            ? "No expenses match your search."
                            : "No petty cash expenses recorded."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={approveTarget != null}
        onOpenChange={(open) => {
          if (!open) setApproveTarget(null);
        }}
        title="Approve this settlement?"
        description={
          approveTarget
            ? `${approveTarget.branch?.name ?? "Branch"} · ${formatDate(approveTarget.date)} · expected ${formatBaht(approveTarget.expectedCash)}, actual ${formatBaht(approveTarget.actualCash)}, diff ${approveTarget.difference >= 0 ? "+" : "-"}${formatBaht(Math.abs(approveTarget.difference))}.`
            : undefined
        }
        confirmLabel="Approve settlement"
        loading={approveSettlementMutation.isPending}
        onConfirm={() => {
          if (approveTarget) return handleApprove(approveTarget.id);
        }}
      />
    </div>
  );
}
