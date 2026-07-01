"use client";

import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import {
  ListMobileCard,
  ListMobileCardSkeleton,
  ResponsiveDataTableLayout,
} from "@/components/shared/responsive-data-table";
import { TableActionButton } from "@/components/shared/table-action-button";
import { Button } from "@/components/ui/button";
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
import { formatDateTime } from "@/lib/intl-date";
import {
  dataTableContainerClassName,
  nativeTableEmptyCellClassName,
  semanticTableClassName,
} from "@/lib/theme/data-table";
import { settingsMutedMetaClassName } from "@/lib/theme/settings-hub-chrome";
import { text } from "@/lib/theme/surface";
import { typeMicroClassName } from "@/lib/theme/typography";
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

function AuditDesktopTable({
  pageLogs,
  loading,
  emptyMessage,
  onSelectLog,
}: {
  pageLogs: AuditLogRow[];
  loading: boolean;
  emptyMessage: string;
  onSelectLog: (log: AuditLogRow) => void;
}) {
  return (
    <div className={semanticTableClassName()}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Module</TableHead>
            <TableHead className="w-[56px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="p-4">
                <ListMobileCardSkeleton rows={5} />
              </TableCell>
            </TableRow>
          ) : pageLogs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className={nativeTableEmptyCellClassName("h-24")}>
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            pageLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className={cn("whitespace-nowrap tabular-nums", text.subtle)}>
                  {formatDateTime(log.createdAt)}
                </TableCell>
                <TableCell>
                  <span className={cn("block max-w-[200px] truncate", text.primary)}>
                    {log.user?.name || log.user?.email}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={text.secondary}>{auditActionLabel(log.action)}</span>
                </TableCell>
                <TableCell>
                  <span className={cn("block max-w-[220px] truncate", text.secondary)}>
                    {auditTargetTypeLabel(log.targetType)}
                    {log.targetId != null && (
                      <span className={text.muted}> #{log.targetId}</span>
                    )}
                  </span>
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

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
        <ResponsiveDataTableLayout
          mobile={
            loading ? (
              <ResponsiveDataTableLayout.Skeleton />
            ) : pageLogs.length === 0 ? (
              <ResponsiveDataTableLayout.Empty message={emptyMessage} />
            ) : (
              pageLogs.map((log) => {
                const details = formatAuditDetails(log.details);
                return (
                  <ListMobileCard key={log.id} onClick={() => onSelectLog(log)}>
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <time
                        className={cn(typeMicroClassName("tabular-nums"), text.subtle)}
                        dateTime={log.createdAt}
                      >
                        {formatDateTime(log.createdAt)}
                      </time>
                      <span className={text.secondary}>{auditActionLabel(log.action)}</span>
                    </div>
                    <p className={cn("truncate font-medium", text.primary)}>
                      {log.user?.name || log.user?.email}
                    </p>
                    <p className={settingsMutedMetaClassName("truncate")}>
                      {auditTargetTypeLabel(log.targetType)}
                      {details.preview ? ` · ${details.preview}` : ""}
                    </p>
                  </ListMobileCard>
                );
              })
            )
          }
          desktop={
            <AuditDesktopTable
              pageLogs={pageLogs}
              loading={loading}
              emptyMessage={emptyMessage}
              onSelectLog={onSelectLog}
            />
          }
        />
      </div>

      {!loading && filteredCount > pageSize && (
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className={cn("text-sm tabular-nums", text.muted)}>
            Page {currentPage} of {totalPages}
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
              <ChevronLeft className="h-4 w-4" aria-hidden />
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
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
