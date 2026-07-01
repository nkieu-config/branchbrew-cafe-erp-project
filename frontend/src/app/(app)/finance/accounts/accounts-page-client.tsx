"use client";

import { useMemo, useState } from "react";
import { Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { HubListPage } from "@/components/shared/hub-list-page";
import { ListFilterSelect } from "@/components/shared/list-filters";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ChartOfAccountsTable } from "@/components/finance/ChartOfAccountsTable";
import { useAccounts } from "@/hooks/domains/useAccountingQueries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { seedAccounts } from "@/lib/api";
import { groupAccountsByType } from "@/lib/accounts";
import {
  type AccountActiveFilter,
  type AccountTypeFilter,
  accountTypeLabel,
  accountTypesForLegend,
  filterAccountTree,
  summarizeAccounts,
} from "@/lib/account-filters";
import { getErrorMessage } from "@/lib/errors";
import { financeSectionPanelClassName } from "@/lib/theme/finance";
import { infoBannerClassName, infoBannerTextClassName } from "@/lib/theme/hub-banners";
import { hubCtaClassName } from "@/lib/theme/hub-primitives";

export default function AccountsPageClient() {
  const {
    data: accountsData = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAccounts();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase(), 300);
  const [typeFilter, setTypeFilter] = useState<AccountTypeFilter>("ALL");
  const [activeFilter, setActiveFilter] = useState<AccountActiveFilter>("ALL");
  const [isSeeding, setIsSeeding] = useState(false);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);

  const accountsTree = useMemo(() => groupAccountsByType(accountsData), [accountsData]);
  const summary = useMemo(() => summarizeAccounts(accountsData), [accountsData]);

  const filteredTree = useMemo(
    () =>
      filterAccountTree(accountsTree, {
        search: debouncedSearch,
        typeFilter,
        activeFilter,
      }),
    [accountsTree, debouncedSearch, typeFilter, activeFilter],
  );

  const hasActiveFilters =
    search.trim().length > 0 || typeFilter !== "ALL" || activeFilter !== "ALL";
  const showSeedAction = accountsData.length === 0 && !isLoading && !isError;
  const filteredAccountCount = filteredTree.reduce(
    (count, group) => count + group.children.length,
    0,
  );

  const handleSeed = async () => {
    try {
      setIsSeeding(true);
      await seedAccounts();
      toast.success("Chart of accounts seeded");
      setShowSeedConfirm(false);
      void refetch();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to seed accounts"));
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <>
      {showSeedAction ? (
        <div className="mb-4 flex justify-end">
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
                No chart of accounts yet — seed to enable journal posting
              </p>
            </div>
          </HubListPage.Banner>
        )}

        <HubListPage.Error
          message={isError ? getErrorMessage(error, "Failed to load chart of accounts") : undefined}
          onRetry={() => void refetch()}
          loading={isFetching}
        />

        <HubListPage.Toolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search code or name…"
          showReset={hasActiveFilters}
          onReset={() => {
            setSearch("");
            setTypeFilter("ALL");
            setActiveFilter("ALL");
          }}
          filters={
            <>
              <ListFilterSelect
                value={typeFilter}
                onValueChange={(value) => setTypeFilter(value as AccountTypeFilter)}
                ariaLabel="Filter by account type"
                widthClassName="w-full sm:w-[160px]"
                options={[
                  { value: "ALL", label: "All types" },
                  ...accountTypesForLegend().map((type) => ({
                    value: type,
                    label: accountTypeLabel(type),
                  })),
                ]}
              />
              <ListFilterSelect
                value={activeFilter}
                onValueChange={(value) => setActiveFilter(value as AccountActiveFilter)}
                ariaLabel="Filter by account status"
                widthClassName="w-full sm:w-[160px]"
                options={[
                  { value: "ALL", label: "All statuses" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
            </>
          }
        />

        <HubListPage.Count
          isLoading={isLoading}
          isError={isError}
          isFetching={isFetching}
          hasActiveFilters={hasActiveFilters}
          filteredCount={filteredAccountCount}
          totalCount={summary.total}
          itemLabel="account"
          emptyLabel="No accounts yet"
        />

        <ChartOfAccountsTable
          accounts={filteredTree}
          isLoading={isLoading}
          hasActiveFilters={hasActiveFilters}
          showSeedAction={showSeedAction}
        />
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
    </>
  );
}
