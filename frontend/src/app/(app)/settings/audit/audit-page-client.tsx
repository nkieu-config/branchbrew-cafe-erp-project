"use client";

import { useEffect, useMemo, useState } from "react";
import { History, Loader2 } from "lucide-react";
import { useAuditLogs } from "@/hooks/domains/useReportsQueries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { HubPageHeader } from "@/components/shared/hub-card";
import { HubListPage } from "@/components/shared/hub-list-page";
import { ListFilterSelect } from "@/components/shared/list-filters";
import { AuditLogDetailSheet } from "@/components/settings/AuditLogDetailSheet";
import { AuditLogTable } from "@/components/settings/AuditLogTable";
import { Button } from "@/components/ui/button";
import {
  type AuditActionCategory,
  type AuditLogRow,
  type AuditTargetTypeFilter,
  auditTargetTypeLabel,
  filterAuditLogs,
  uniqueAuditTargetTypes,
} from "@/lib/audit-filters";
import { getErrorMessage } from "@/lib/errors";
import {
  infoBannerClassName,
  infoBannerIconClassName,
  infoBannerTextClassName,
  infoBannerTitleClassName,
} from "@/lib/theme/hub-banners";
import { hubLoadingSpinnerClassName } from "@/lib/theme/hub-primitives";
import { settingsSectionPanelClassName } from "@/lib/theme/settings-hub-chrome";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;
const FETCH_BATCH = 100;

export default function AuditPageClient() {
  const [fetchLimit, setFetchLimit] = useState(FETCH_BATCH);
  const {
    data: logsData = [],
    isLoading: loading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAuditLogs(fetchLimit, 0);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase(), 300);
  const [actionFilter, setActionFilter] = useState<AuditActionCategory>("ALL");
  const [targetTypeFilter, setTargetTypeFilter] = useState<AuditTargetTypeFilter>("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLogRow | null>(null);

  const logs = logsData as AuditLogRow[];
  const targetTypes = useMemo(() => uniqueAuditTargetTypes(logs), [logs]);
  const entryCount = logs.length;

  const filteredLogs = useMemo(
    () =>
      filterAuditLogs(logs, {
        search: debouncedSearch,
        actionFilter,
        targetTypeFilter,
      }),
    [logs, debouncedSearch, actionFilter, targetTypeFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const mayHaveOlderEntries = logs.length >= fetchLimit;

  const pageLogs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, currentPage]);

  const hasActiveFilters =
    search.trim().length > 0 || actionFilter !== "ALL" || targetTypeFilter !== "ALL";

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const resetFilters = () => {
    setSearch("");
    setActionFilter("ALL");
    setTargetTypeFilter("ALL");
    setPage(1);
  };

  const entryCountLabel = (count: number) =>
    `${count} entr${count === 1 ? "y" : "ies"}`;

  const formatLoadedSummary = () => {
    const olderSuffix = mayHaveOlderEntries ? ` · latest ${fetchLimit} loaded` : "";
    if (hasActiveFilters) {
      return `${filteredLogs.length} of ${entryCount} entries${olderSuffix}`;
    }
    return `${entryCountLabel(entryCount)}${olderSuffix}`;
  };

  return (
    <div className="space-y-6 max-w-6xl w-full">
      <HubPageHeader hideTitle accentHub="settings" />

      <HubListPage className={settingsSectionPanelClassName()}>
        {!loading && !isError && entryCount === 0 && (
          <HubListPage.Banner>
            <div className={infoBannerClassName()}>
              <div className="flex items-start gap-3">
                <History className={infoBannerIconClassName()} aria-hidden />
                <div>
                  <p className={infoBannerTitleClassName()}>No audit entries yet</p>
                  <p className={infoBannerTextClassName()}>
                    Critical actions such as purchase orders, stock transfers, settlements, and waste
                    adjustments appear here once recorded by the system.
                  </p>
                </div>
              </div>
            </div>
          </HubListPage.Banner>
        )}

        <HubListPage.Error
          message={isError ? getErrorMessage(error, "Failed to load audit logs.") : undefined}
          onRetry={() => void refetch()}
          loading={isFetching}
        />

        <HubListPage.Toolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Search action, user, module…"
          showReset={hasActiveFilters}
          onReset={resetFilters}
          filters={
            <>
              <ListFilterSelect
                value={actionFilter}
                onValueChange={(value) => {
                  setActionFilter(value as AuditActionCategory);
                  setPage(1);
                }}
                ariaLabel="Filter by action type"
                widthClassName="w-full sm:w-[160px]"
                options={[
                  { value: "ALL", label: "All actions" },
                  { value: "create", label: "Create" },
                  { value: "update", label: "Update" },
                  { value: "approve", label: "Approve" },
                  { value: "delete", label: "Delete / reject" },
                  { value: "other", label: "Other" },
                ]}
              />
              {targetTypes.length > 1 && (
                <ListFilterSelect
                  value={targetTypeFilter}
                  onValueChange={(value) => {
                    setTargetTypeFilter(value as AuditTargetTypeFilter);
                    setPage(1);
                  }}
                  ariaLabel="Filter by target module"
                  widthClassName="w-full sm:w-[180px]"
                  options={[
                    { value: "ALL", label: "All modules" },
                    ...targetTypes.map((targetType) => ({
                      value: targetType,
                      label: auditTargetTypeLabel(targetType),
                    })),
                  ]}
                />
              )}
            </>
          }
        />

        {entryCount > 0 && (
          <HubListPage.Count
            isLoading={loading}
            isError={isError}
            isFetching={isFetching}
            actions={
              mayHaveOlderEntries ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 min-h-[44px] font-medium"
                  disabled={isFetching}
                  onClick={() => setFetchLimit((current) => current + FETCH_BATCH)}
                >
                  {isFetching ? (
                    <Loader2
                      className={cn("w-4 h-4 mr-2 animate-spin", hubLoadingSpinnerClassName())}
                      aria-hidden
                    />
                  ) : null}
                  Load older entries
                </Button>
              ) : undefined
            }
          >
            {formatLoadedSummary()}
          </HubListPage.Count>
        )}

        <AuditLogTable
          pageLogs={pageLogs}
          loading={loading}
          hasActiveFilters={hasActiveFilters}
          currentPage={currentPage}
          totalPages={totalPages}
          filteredCount={filteredLogs.length}
          pageSize={PAGE_SIZE}
          onSelectLog={setSelectedLog}
          onPreviousPage={() => setPage((p) => Math.max(1, p - 1))}
          onNextPage={() => setPage((p) => Math.min(totalPages, p + 1))}
        />
      </HubListPage>

      <AuditLogDetailSheet
        log={selectedLog}
        open={selectedLog != null}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
