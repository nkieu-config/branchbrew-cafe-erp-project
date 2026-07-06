"use client";

import { useCallback, useEffect, useMemo, useState, useDeferredValue } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { HubListPage } from "@/components/shared/hub-list-page";
import { ListFilterSelect } from "@/components/shared/list-filters";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ApAgingCard } from "@/components/finance/ApAgingCard";
import { VatReportCard } from "@/components/finance/VatReportCard";
import { ExpensesTable } from "@/components/finance/ExpensesTable";
import { SettlementsTable } from "@/components/finance/SettlementsTable";
import {
  useApproveSettlement,
  useFinanceExpenses,
  useFinanceSettlements,
} from "@/hooks/domains/useFinanceQueries";
import { exportSales } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { formatCurrency } from "@/lib/money";
import { formatDate } from "@/lib/intl-date";
import {
  type SettlementStatusFilter,
  filterExpenses,
  filterSettlements,
  summarizeFinanceOverview,
} from "@/lib/filters/finance-overview-filters";
import {
  buildFinanceOverviewUrl,
  parseFinanceOverviewSearchParams,
} from "@/lib/finance-hub-url";
import { financeSectionPanelClassName } from "@/lib/theme/finance";
import { infoBannerClassName, infoBannerTextClassName } from "@/lib/theme/hub-banners";
import { hubCtaClassName } from "@/lib/theme/hub-primitives";
import type { Settlement } from "@/types/api";

export default function OverviewPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, activeBranchId } = useAuth();
  const branchIdNum = activeBranchId ? Number(activeBranchId) : undefined;

  const initialStatus = parseFinanceOverviewSearchParams(searchParams).statusFilter;

  const settlementStatusParam = searchParams.get("status");

  const [settlementFilter, setSettlementFilter] = useState<SettlementStatusFilter>(initialStatus);
  const [expenseSearch, setExpenseSearch] = useState("");
  const deferredExpenseSearch = useDeferredValue(expenseSearch.trim().toLowerCase());
  const [approveTarget, setApproveTarget] = useState<Settlement | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (
      settlementStatusParam === "PENDING" ||
      settlementStatusParam === "APPROVED" ||
      settlementStatusParam === "REJECTED"
    ) {
      setSettlementFilter(settlementStatusParam);
      return;
    }
    setSettlementFilter("ALL");
  }, [settlementStatusParam]);

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
  const isLoading = loadingSettlements || loadingExpenses;
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
    () => filterExpenses(expenses, deferredExpenseSearch),
    [expenses, deferredExpenseSearch],
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
    <div className="space-y-4" data-testid="finance-overview">
      <div className="flex justify-end">
        <Button
          onClick={() => void handleExport()}
          disabled={isExporting}
          className={hubCtaClassName("finance")}
          data-testid="finance-export-sales"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin motion-reduce:animate-none" aria-hidden />
              Exporting…
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" aria-hidden />
              Export sales
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ApAgingCard />
        <VatReportCard />
      </div>

      <HubListPage className={financeSectionPanelClassName()}>
        {initialStatus === "PENDING" && summary.pending > 0 && (
          <HubListPage.Banner>
            <div className={infoBannerClassName("py-3")}>
              <p className={infoBannerTextClassName()}>
                {summary.pending} settlement{summary.pending === 1 ? "" : "s"} awaiting approval
              </p>
            </div>
          </HubListPage.Banner>
        )}

        <HubListPage.Error
          message={hasError ? errorMessage : undefined}
          onRetry={handleRetry}
          loading={isFetching}
        />

        <HubListPage.Toolbar
          search={expenseSearch}
          onSearchChange={setExpenseSearch}
          searchPlaceholder="Search expenses…"
          searchTestId="finance-expense-search"
          showReset={hasActiveFilters}
          onReset={() => {
            setSettlementFilterAndUrl("ALL");
            setExpenseSearch("");
          }}
          filters={
            <ListFilterSelect
              value={settlementFilter}
              onValueChange={(value) =>
                setSettlementFilterAndUrl(value as SettlementStatusFilter)
              }
              ariaLabel="Filter settlements by status"
              widthClassName="w-full sm:w-[180px]"
              options={[
                { value: "ALL", label: "All settlements" },
                { value: "PENDING", label: "Pending" },
                { value: "APPROVED", label: "Approved" },
                { value: "REJECTED", label: "Rejected" },
              ]}
            />
          }
        />

        <HubListPage.Count isLoading={isLoading} isError={hasError} isFetching={isFetching}>
          {hasActiveFilters
            ? `${visibleSettlements.length} of ${settlements.length} settlements · ${visibleExpenses.length} of ${expenses.length} expenses`
            : `${summary.settlements} settlements · ${summary.expenses} expenses`}
        </HubListPage.Count>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SettlementsTable
            settlements={visibleSettlements}
            loading={loadingSettlements}
            settlementFilter={settlementFilter}
            onApprove={setApproveTarget}
          />
          <ExpensesTable
            expenses={visibleExpenses}
            loading={loadingExpenses}
            expenseSearch={expenseSearch}
          />
        </div>
      </HubListPage>

      <ConfirmDialog
        open={approveTarget != null}
        onOpenChange={(open) => {
          if (!open) setApproveTarget(null);
        }}
        title="Approve settlement?"
        description={
          approveTarget
            ? `${approveTarget.branch?.name ?? "Branch"} · ${formatDate(approveTarget.date)} · diff ${approveTarget.difference >= 0 ? "+" : "-"}${formatCurrency(Math.abs(approveTarget.difference))}`
            : undefined
        }
        confirmLabel="Approve"
        loading={approveSettlementMutation.isPending}
        onConfirm={() => {
          if (approveTarget) return handleApprove(approveTarget.id);
        }}
      />
    </div>
  );
}
