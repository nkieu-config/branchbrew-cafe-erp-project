"use client";

import { useEffect, useMemo, useState } from "react";
import { User, Activity, FileText, ChevronLeft, ChevronRight, Eye, History, Loader2 } from "lucide-react";
import { useAuditLogs } from "@/hooks/domains/useReportsQueries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { HubPageHeader } from "@/components/shared/hub-card";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { QueryErrorBanner } from "@/components/shared/query-error-banner";
import { StatusBadge, auditActionTone } from "@/components/shared/status-badge";
import { TableActionButton } from "@/components/shared/table-action-button";
import { SettingsHubLinks } from "@/components/settings/SettingsHubLinks";
import { AuditLogDetailSheet } from "@/components/settings/AuditLogDetailSheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type AuditActionCategory,
  type AuditLogRow,
  type AuditTargetTypeFilter,
  auditActionLabel,
  auditTargetTypeLabel,
  filterAuditLogs,
  formatAuditDetails,
  summarizeAuditLogs,
  uniqueAuditTargetTypes,
} from "@/lib/audit-filters";
import { roleLabel } from "@/lib/employee-filters";
import { formatDateTime } from "@/lib/intl-date";
import { getErrorMessage } from "@/lib/errors";
import {
  auditLegendSwatchClassName,
  dataTableContainerClassName,
  formSelectContentClassName,
  hubLoadingSpinnerClassName,
  infoBannerClassName,
  infoBannerIconClassName,
  infoBannerTextClassName,
  infoBannerTitleClassName,
  inventorySummaryStripClassName,
  listToolbarFieldClassName,
  metricValueClassName,
  nativeTableEmptyCellClassName,
  semanticTableClassName,
  settingsSectionPanelClassName,
  settingsSummaryChipClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;
const FETCH_BATCH = 100;

export default function AuditLogsPage() {
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
  const summary = useMemo(() => summarizeAuditLogs(logs), [logs]);

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

  const toggleActionFilter = (next: AuditActionCategory) => {
    setActionFilter((current) => (current === next ? "ALL" : next));
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setActionFilter("ALL");
    setTargetTypeFilter("ALL");
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-6xl w-full">
      <HubPageHeader
        hideTitle
        accentHub="settings"
        description="Comprehensive log of critical system actions and data modifications."
        actions={<SettingsHubLinks current="audit" />}
      />

      <div className={settingsSectionPanelClassName()}>
        {!loading && !isError && summary.total === 0 && (
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
        )}

        {!loading && !isError && summary.total > 0 && mayHaveOlderEntries && (
          <div className={infoBannerClassName()}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3 min-w-0">
                <History className={infoBannerIconClassName()} aria-hidden />
                <div>
                  <p className={infoBannerTitleClassName()}>Showing recent history</p>
                  <p className={infoBannerTextClassName()}>
                    Loaded the most recent {fetchLimit} entries. Load older records if you need to
                    investigate further back.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 min-h-[44px] font-medium"
                disabled={isFetching}
                onClick={() => setFetchLimit((current) => current + FETCH_BATCH)}
              >
                {isFetching ? (
                  <Loader2 className={cn("w-4 h-4 mr-2 animate-spin", hubLoadingSpinnerClassName())} aria-hidden />
                ) : null}
                Load older entries
              </Button>
            </div>
          </div>
        )}

        {!loading && !isError && summary.total > 0 && (
          <div
            className={inventorySummaryStripClassName()}
            aria-live="polite"
            aria-atomic="true"
          >
            <span className={cn("font-semibold tabular-nums", text.primary)}>
              {summary.total} entr{summary.total === 1 ? "y" : "ies"}
              {mayHaveOlderEntries ? ` · latest ${fetchLimit} loaded` : " loaded"}
            </span>
            {summary.create > 0 && (
              <button
                type="button"
                className={settingsSummaryChipClassName(
                  actionFilter === "create",
                  metricValueClassName("blue"),
                )}
                onClick={() => toggleActionFilter("create")}
              >
                {summary.create} create
              </button>
            )}
            {summary.update > 0 && (
              <button
                type="button"
                className={settingsSummaryChipClassName(
                  actionFilter === "update",
                  metricValueClassName("amber"),
                )}
                onClick={() => toggleActionFilter("update")}
              >
                {summary.update} update
              </button>
            )}
            {summary.approve > 0 && (
              <button
                type="button"
                className={settingsSummaryChipClassName(
                  actionFilter === "approve",
                  metricValueClassName("emerald"),
                )}
                onClick={() => toggleActionFilter("approve")}
              >
                {summary.approve} approve
              </button>
            )}
            {summary.delete > 0 && (
              <button
                type="button"
                className={settingsSummaryChipClassName(
                  actionFilter === "delete",
                  metricValueClassName("red"),
                )}
                onClick={() => toggleActionFilter("delete")}
              >
                {summary.delete} delete
              </button>
            )}
            {summary.other > 0 && (
              <button
                type="button"
                className={settingsSummaryChipClassName(
                  actionFilter === "other",
                  text.muted,
                )}
                onClick={() => toggleActionFilter("other")}
              >
                {summary.other} other
              </button>
            )}
          </div>
        )}

        {!loading && !isError && summary.total > 0 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--text-subtle)]">
            <span className="font-medium uppercase tracking-wide">Legend</span>
            <span className="inline-flex items-center gap-1.5">
              <span className={auditLegendSwatchClassName("create")} aria-hidden />
              Create
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className={auditLegendSwatchClassName("update")} aria-hidden />
              Update
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className={auditLegendSwatchClassName("approve")} aria-hidden />
              Approve
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className={auditLegendSwatchClassName("delete")} aria-hidden />
              Delete / reject
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className={auditLegendSwatchClassName("other")} aria-hidden />
              Other
            </span>
          </div>
        )}

        {isError && (
          <QueryErrorBanner
            message={getErrorMessage(error, "Failed to load audit logs.")}
            onRetry={() => void refetch()}
            loading={isFetching}
          />
        )}

        <ListToolbar
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
              <Select
                value={actionFilter}
                onValueChange={(value) => {
                  if (value) {
                    setActionFilter(value as AuditActionCategory);
                    setPage(1);
                  }
                }}
              >
                <SelectTrigger
                  className={listToolbarFieldClassName("w-full sm:w-[160px]")}
                  aria-label="Filter by action type"
                >
                  <SelectValue placeholder="Action type" />
                </SelectTrigger>
                <SelectContent className={formSelectContentClassName()}>
                  <SelectItem value="ALL">All actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="approve">Approve</SelectItem>
                  <SelectItem value="delete">Delete / reject</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {targetTypes.length > 1 && (
                <Select
                  value={targetTypeFilter}
                  onValueChange={(value) => {
                    if (value) {
                      setTargetTypeFilter(value as AuditTargetTypeFilter);
                      setPage(1);
                    }
                  }}
                >
                  <SelectTrigger
                    className={listToolbarFieldClassName("w-full sm:w-[180px]")}
                    aria-label="Filter by target module"
                  >
                    <SelectValue placeholder="Module" />
                  </SelectTrigger>
                  <SelectContent className={formSelectContentClassName()}>
                    <SelectItem value="ALL">All modules</SelectItem>
                    {targetTypes.map((targetType) => (
                      <SelectItem key={targetType} value={targetType}>
                        {auditTargetTypeLabel(targetType)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </>
          }
        />

        <div className={dataTableContainerClassName()}>
          <div className={semanticTableClassName()}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead className="hidden md:table-cell">Target module</TableHead>
                  <TableHead className="hidden lg:table-cell max-w-md">Details</TableHead>
                  <TableHead className="w-[88px] text-right">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-5 w-full max-w-[140px]" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : pageLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className={nativeTableEmptyCellClassName("h-24")}>
                      {hasActiveFilters
                        ? "No audit entries match your filters."
                        : "No audit entries recorded yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  pageLogs.map((log) => {
                    const details = formatAuditDetails(log.details);
                    return (
                      <TableRow key={log.id}>
                        <TableCell
                          className={cn("font-medium whitespace-nowrap tabular-nums", text.subtle)}
                        >
                          {formatDateTime(log.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-0">
                            <User className={cn("w-4 h-4 shrink-0", text.muted)} aria-hidden />
                            <div className="min-w-0">
                              <span className={cn("font-medium block truncate", text.primary)}>
                                {log.user?.name || log.user?.email}
                              </span>
                              {log.user?.role && (
                                <span className={cn("text-xs block truncate", text.muted)}>
                                  {roleLabel(log.user.role)}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge tone={auditActionTone(log.action)}>
                            {auditActionLabel(log.action)}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className={cn("flex items-center gap-1.5 min-w-0", text.secondary)}>
                            <Activity className={cn("w-4 h-4 shrink-0", text.muted)} aria-hidden />
                            <span className="truncate">{auditTargetTypeLabel(log.targetType)}</span>
                            {log.targetId != null && (
                              <span className={cn("shrink-0 tabular-nums", text.muted)}>
                                #{log.targetId}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell max-w-md">
                          <div className={cn("flex items-start gap-1.5 text-sm min-w-0", text.muted)}>
                            <FileText className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
                            <span className="truncate">{details.preview}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <TableActionButton
                            label="View entry"
                            icon={Eye}
                            iconOnly
                            tone="blue"
                            onClick={() => setSelectedLog(log)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {!loading && filteredLogs.length > PAGE_SIZE && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
            <p className={cn("text-sm tabular-nums", text.muted)}>
              Page {currentPage} of {totalPages} ({filteredLogs.length} entries)
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-[44px] min-w-[44px]"
                disabled={currentPage <= 1}
                aria-label="Previous page"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" aria-hidden />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-[44px] min-w-[44px]"
                disabled={currentPage >= totalPages}
                aria-label="Next page"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="w-4 h-4" aria-hidden />
              </Button>
            </div>
          </div>
        )}
      </div>

      <AuditLogDetailSheet
        log={selectedLog}
        open={selectedLog != null}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
