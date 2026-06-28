"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnsType } from "antd/es/table";
import { seedAccounts } from "@/lib/api";
import { BookOpen, Landmark, Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { HubPageHeader } from "@/components/shared/hub-card";
import { DataTable } from "@/components/shared/data-table";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { QueryErrorBanner } from "@/components/shared/query-error-banner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FinanceHubLinks } from "@/components/finance/FinanceHubLinks";
import { StatusBadge, accountTypeTone } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccounts } from "@/hooks/domains/useAccountingQueries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
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
import type { AccountTableRow } from "@/types/api";
import {
  accountLegendSwatchClassName,
  financeHubIconClassName,
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
  tableCellMutedClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function ChartOfAccountsPage() {
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

  const toggleTypeFilter = (next: AccountTypeFilter) => {
    setTypeFilter((current) => (current === next ? "ALL" : next));
  };

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

  const columns = useMemo(
    () =>
      [
        {
          title: "Code",
          dataIndex: "code",
          key: "code",
          width: 150,
          render: (code: string, record: AccountTableRow) =>
            "isGroup" in record && record.isGroup ? (
              <span className={cn("font-semibold uppercase tracking-wide", text.primary)}>
                {accountTypeLabel(record.type)}
              </span>
            ) : (
              <span className="font-mono font-medium tabular-nums">{code}</span>
            ),
        },
        {
          title: "Name",
          dataIndex: "name",
          key: "name",
          render: (name: string, record: AccountTableRow) =>
            "isGroup" in record && record.isGroup ? (
              <span className={cn("font-bold", text.primary)}>{name}</span>
            ) : (
              <span className={text.secondary}>{name}</span>
            ),
        },
        {
          title: "Type",
          dataIndex: "type",
          key: "type",
          width: 150,
          responsive: ["md"],
          render: (type: string, record: AccountTableRow) => {
            if ("isGroup" in record && record.isGroup) return null;
            return (
              <StatusBadge tone={accountTypeTone(type)}>{accountTypeLabel(type)}</StatusBadge>
            );
          },
        },
        {
          title: "Description",
          dataIndex: "description",
          key: "description",
          responsive: ["lg"],
          render: (description: string | null | undefined, record: AccountTableRow) => {
            if ("isGroup" in record && record.isGroup) return null;
            return description?.trim() ? (
              <span className={cn("line-clamp-2 text-sm", text.subtle)}>{description}</span>
            ) : (
              <span className={text.muted}>—</span>
            );
          },
        },
        {
          title: "Status",
          dataIndex: "isActive",
          key: "isActive",
          width: 110,
          render: (isActive: boolean, record: AccountTableRow) => {
            if ("isGroup" in record && record.isGroup) {
              return (
                <span className={cn("text-xs tabular-nums", text.muted)}>
                  {record.children.length} account{record.children.length === 1 ? "" : "s"}
                </span>
              );
            }
            return isActive ? (
              <StatusBadge tone="success">Active</StatusBadge>
            ) : (
              <StatusBadge tone="neutral">Inactive</StatusBadge>
            );
          },
        },
      ] as ColumnsType<AccountTableRow>,
    [],
  );

  return (
    <>
      <div className="space-y-6">
        <HubPageHeader
          hideTitle
          icon={Landmark}
          accentHub="finance"
          description="Standard accounting codes grouped by type. Used by journal entries and the general ledger."
          actions={
            <FinanceHubLinks current="accounts">
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
                  <p className={infoBannerTitleClassName()}>No chart of accounts yet</p>
                  <p className={infoBannerTextClassName()}>
                    Seed standard accounting codes to enable journal posting, or open the{" "}
                    <Link href="/finance/ledger" className={inlineLinkClassName()}>
                      general ledger
                    </Link>{" "}
                    after seeding.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !isError && summary.total > 0 && (
            <div
              className={inventorySummaryStripClassName()}
              aria-live="polite"
              aria-atomic="true"
            >
              <span className={cn("font-semibold tabular-nums", text.primary)}>
                {summary.total} account{summary.total === 1 ? "" : "s"}
              </span>
              {summary.active > 0 && (
                <button
                  type="button"
                  className={financeSummaryChipClassName(
                    activeFilter === "active",
                    metricValueClassName("emerald"),
                  )}
                  onClick={() =>
                    setActiveFilter((current) => (current === "active" ? "ALL" : "active"))
                  }
                >
                  {summary.active} active
                </button>
              )}
              {summary.inactive > 0 && (
                <button
                  type="button"
                  className={financeSummaryChipClassName(
                    activeFilter === "inactive",
                    text.muted,
                  )}
                  onClick={() =>
                    setActiveFilter((current) => (current === "inactive" ? "ALL" : "inactive"))
                  }
                >
                  {summary.inactive} inactive
                </button>
              )}
              {accountTypesForLegend().map((type) => {
                const count = summary.byType[type];
                if (count === 0) return null;
                return (
                  <button
                    key={type}
                    type="button"
                    className={financeSummaryChipClassName(
                      typeFilter === type,
                      metricValueClassName(
                        type === "ASSET"
                          ? "blue"
                          : type === "LIABILITY"
                            ? "red"
                            : type === "EQUITY"
                              ? "purple"
                              : type === "REVENUE"
                                ? "emerald"
                                : "amber",
                      ),
                    )}
                    onClick={() => toggleTypeFilter(type)}
                  >
                    {count} {accountTypeLabel(type).toLowerCase()}
                  </button>
                );
              })}
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

          {!isLoading && !isError && summary.total > 0 && (
            <div
              className={cn(
                "flex flex-wrap items-center gap-x-4 gap-y-2 text-xs",
                "pb-3 border-b border-[var(--table-row-border)]",
              )}
              aria-label="Account type legend"
            >
              {accountTypesForLegend().map((type) => (
                <span
                  key={type}
                  className={cn("inline-flex items-center gap-1.5 font-medium", text.secondary)}
                >
                  <span className={accountLegendSwatchClassName(type)} aria-hidden />
                  {accountTypeLabel(type)}
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

          {isError && (
            <QueryErrorBanner
              message={getErrorMessage(error, "Failed to load chart of accounts")}
              onRetry={() => void refetch()}
              loading={isFetching}
            />
          )}

          <ListToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search code, name, description…"
            showReset={hasActiveFilters}
            onReset={() => {
              setSearch("");
              setTypeFilter("ALL");
              setActiveFilter("ALL");
            }}
            filters={
              <>
                <Select
                  value={typeFilter}
                  onValueChange={(value) => value && setTypeFilter(value as AccountTypeFilter)}
                >
                  <SelectTrigger
                    className={listToolbarFieldClassName("min-h-[44px] w-full sm:w-[160px]")}
                    aria-label="Filter by account type"
                  >
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent className={formSelectContentClassName()}>
                    <SelectItem value="ALL">All types</SelectItem>
                    {accountTypesForLegend().map((type) => (
                      <SelectItem key={type} value={type}>
                        {accountTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={activeFilter}
                  onValueChange={(value) =>
                    value && setActiveFilter(value as AccountActiveFilter)
                  }
                >
                  <SelectTrigger
                    className={listToolbarFieldClassName("min-h-[44px] w-full sm:w-[160px]")}
                    aria-label="Filter by account status"
                  >
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent className={formSelectContentClassName()}>
                    <SelectItem value="ALL">All statuses</SelectItem>
                    <SelectItem value="active">Active only</SelectItem>
                    <SelectItem value="inactive">Inactive only</SelectItem>
                  </SelectContent>
                </Select>
              </>
            }
          />

          <div className={financeSectionPanelClassName("border border-[var(--table-container-border)] bg-[var(--table-container-bg)]")}>
            <h2 className={financeSectionTitleClassName()}>
              <Landmark className={financeHubIconClassName()} aria-hidden />
              Account hierarchy
            </h2>
            <DataTable
              columns={columns}
              dataSource={filteredTree}
              rowKey="id"
              loading={isLoading}
              pagination={false}
              defaultExpandAllRows
              emptyDescription={
                hasActiveFilters
                  ? "No accounts match the current filters."
                  : showSeedAction
                    ? "Seed the chart of accounts to get started."
                    : "No accounts found."
              }
            />
            {!isLoading && filteredTree.length > 0 && (
              <p className={cn("mt-3 text-xs", tableCellMutedClassName())}>
                Accounts are grouped by type. Expand or collapse sections using the row controls.
              </p>
            )}
          </div>
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
    </>
  );
}
