"use client";

import { User, Activity, FileText, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { StatusBadge, auditActionTone } from "@/components/shared/status-badge";
import { TableActionButton } from "@/components/shared/table-action-button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type AuditLogRow,
  auditActionLabel,
  auditTargetTypeLabel,
  formatAuditDetails,
} from "@/lib/audit-filters";
import { roleLabel } from "@/lib/employee-filters";
import { formatDateTime } from "@/lib/intl-date";
import {
  dataTableContainerClassName,
  listMobileCardClassName,
  nativeTableEmptyCellClassName,
  semanticTableClassName,
} from "@/lib/theme/data-table";
import { text } from "@/lib/theme/surface";
import { typeMicroClassName, typeUiLabelClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";

type AuditLogTableProps = {
  pageLogs: AuditLogRow[];
  loading: boolean;
  hasActiveFilters: boolean;
  currentPage: number;
  totalPages: number;
  filteredCount: number;
  pageSize: number;
  onSelectLog: (log: AuditLogRow) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

export function AuditLogTable({
  pageLogs,
  loading,
  hasActiveFilters,
  currentPage,
  totalPages,
  filteredCount,
  pageSize,
  onSelectLog,
  onPreviousPage,
  onNextPage,
}: AuditLogTableProps) {
  const emptyMessage = hasActiveFilters
    ? "No audit entries match your filters."
    : "No audit entries recorded yet.";

  return (
    <>
      <div className={dataTableContainerClassName()}>
        <div className="md:hidden space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))
          ) : pageLogs.length === 0 ? (
            <p className={cn("text-center py-8 text-sm", text.muted)}>{emptyMessage}</p>
          ) : (
            pageLogs.map((log) => {
              const details = formatAuditDetails(log.details);
              return (
                <button
                  key={log.id}
                  type="button"
                  className={listMobileCardClassName()}
                  onClick={() => onSelectLog(log)}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <time
                      className={cn(typeMicroClassName("tabular-nums"), text.subtle)}
                      dateTime={log.createdAt}
                    >
                      {formatDateTime(log.createdAt)}
                    </time>
                    <StatusBadge tone={auditActionTone(log.action)}>
                      {auditActionLabel(log.action)}
                    </StatusBadge>
                  </div>
                  <div className="flex items-center gap-2 min-w-0 mb-2">
                    <User className={cn("w-4 h-4 shrink-0", text.muted)} aria-hidden />
                    <span className={cn("font-medium truncate", text.primary)}>
                      {log.user?.name || log.user?.email}
                    </span>
                  </div>
                  <div className={cn("flex items-center gap-1.5 text-sm min-w-0 mb-1", text.secondary)}>
                    <Activity className={cn("w-4 h-4 shrink-0", text.muted)} aria-hidden />
                    <span className="truncate">{auditTargetTypeLabel(log.targetType)}</span>
                  </div>
                  <p className={cn("text-sm line-clamp-2", text.muted)}>{details.preview}</p>
                  <p className={cn(typeUiLabelClassName("text-xs mt-2"), text.muted)}>
                    Tap to view details
                  </p>
                </button>
              );
            })
          )}
        </div>

        <div className={cn(semanticTableClassName(), "hidden md:block")}>
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
                    {emptyMessage}
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
                          onClick={() => onSelectLog(log)}
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

      {!loading && filteredCount > pageSize && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
          <p className={cn("text-sm tabular-nums", text.muted)}>
            Page {currentPage} of {totalPages} ({filteredCount} entries)
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-[44px] min-w-[44px]"
              disabled={currentPage <= 1}
              aria-label="Previous page"
              onClick={onPreviousPage}
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
              onClick={onNextPage}
            >
              <ChevronRight className="w-4 h-4" aria-hidden />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
