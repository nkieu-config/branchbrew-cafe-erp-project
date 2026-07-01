"use client";

import { useMemo, useState, useDeferredValue } from "react";
import dynamic from "next/dynamic";
import { Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { HubListPage } from "@/components/shared/hub-list-page";
import { ListFilterSelect } from "@/components/shared/list-filters";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { JournalEntriesTable } from "@/components/finance/JournalEntriesTable";
import { useJournalEntries, useLedger } from "@/hooks/domains/useAccountingQueries";
import { seedAccounts } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import {
  type JournalStatusFilter,
  type LedgerChartPoint,
  filterJournalEntries,
  summarizeJournalEntries,
} from "@/lib/ledger-filters";
import { financeSectionLabelClassName, financeSectionPanelClassName } from "@/lib/theme/finance";
import { infoBannerClassName, infoBannerTextClassName } from "@/lib/theme/hub-banners";
import { hubCtaClassName } from "@/lib/theme/hub-primitives";

const LedgerTrendChart = dynamic(
  () => import("@/components/finance/LedgerTrendChart").then((module) => module.LedgerTrendChart),
  { ssr: false },
);

export default function LedgerPageClient() {
  const { activeBranchId } = useAuth();
  const selectedBranch = activeBranchId ? String(activeBranchId) : "ALL";

  const [isSeeding, setIsSeeding] = useState(false);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<JournalStatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

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
  const isLoading = isChartLoading || isEntriesLoading;
  const isFetching = chartFetching || entriesFetching;
  const errorMessage = getErrorMessage(chartErr ?? entriesErr, "Failed to load ledger data");

  const entrySummary = useMemo(() => summarizeJournalEntries(entries), [entries]);

  const filteredEntries = useMemo(
    () =>
      filterJournalEntries(entries, {
        statusFilter,
        search: deferredSearch,
      }),
    [entries, statusFilter, deferredSearch],
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

  return (
    <div className="space-y-4">
      {showSeedAction ? (
        <div className="flex justify-end">
          <Button
            className={hubCtaClassName("finance")}
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
        </div>
      ) : null}

      <HubListPage className={financeSectionPanelClassName()}>
        {showSeedAction && (
          <HubListPage.Banner>
            <div className={infoBannerClassName("py-3")}>
              <p className={infoBannerTextClassName()}>
                Chart of accounts not initialized — seed to start posting entries
              </p>
            </div>
          </HubListPage.Banner>
        )}

        <HubListPage.Error
          message={hasError ? errorMessage : undefined}
          onRetry={() => {
            void refetchChart();
            void refetchEntries();
          }}
          loading={isFetching}
        />

        <HubListPage.Toolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search reference, description…"
          showReset={hasActiveFilters}
          onReset={() => {
            setStatusFilter("ALL");
            setSearch("");
          }}
          filters={
            <ListFilterSelect
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as JournalStatusFilter)}
              ariaLabel="Filter journal entries by status"
              widthClassName="w-full sm:w-[180px]"
              options={[
                { value: "ALL", label: "All statuses" },
                { value: "POSTED", label: "Posted" },
                { value: "DRAFT", label: "Draft" },
              ]}
            />
          }
        />

        <HubListPage.Count
          isLoading={isLoading}
          isError={hasError}
          isFetching={isFetching}
          hasActiveFilters={hasActiveFilters}
          filteredCount={filteredEntries.length}
          totalCount={entrySummary.total}
          itemLabel="entry"
        />

        <div>
          <h2 className={financeSectionLabelClassName()}>P&amp;L trend</h2>
          <LedgerTrendChart data={chartData as LedgerChartPoint[]} loading={isChartLoading} />
        </div>

        <div className="pt-2">
          <h2 className={financeSectionLabelClassName()}>Journal entries</h2>
          <JournalEntriesTable
            entries={filteredEntries}
            isLoading={isEntriesLoading}
            hasActiveFilters={hasActiveFilters}
            showSeedAction={showSeedAction}
          />
        </div>
      </HubListPage>

      <ConfirmDialog
        open={showSeedConfirm}
        onOpenChange={setShowSeedConfirm}
        title="Seed chart of accounts?"
        description="Adds standard accounting codes for journal posting."
        confirmLabel="Seed"
        loading={isSeeding}
        onConfirm={handleSeed}
      />
    </div>
  );
}
