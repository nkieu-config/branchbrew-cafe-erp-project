"use client";

import { useMemo, useState } from "react";
import { useAuditLogs } from "@/hooks/domains/useReportsQueries";
import { User, Activity, FileText, History, ChevronLeft, ChevronRight } from "lucide-react";
import { HubCard } from "@/components/shared/hub-card";
import { StatusBadge, auditActionTone } from "@/components/shared/status-badge";
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
import type { AuditLog, User as ApiUser } from "@/types/api";
import { formatDateTime } from "@/lib/intl-date";
import {
  dataTableContainerClassName,
  nativeTableEmptyCellClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;

export default function AuditLogsPage() {
  const { data: logsData = [], isLoading: loading } = useAuditLogs(100, 0);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(logsData.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pageLogs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return logsData.slice(start, start + PAGE_SIZE);
  }, [logsData, currentPage]);

  return (
    <HubCard
      title="Audit Trail"
      icon={History}
      description="Comprehensive log of critical system actions and data modifications."
    >
      <div className={dataTableContainerClassName()}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target Module</TableHead>
              <TableHead className="max-w-md">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full max-w-[140px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : pageLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className={nativeTableEmptyCellClassName("h-24")}>
                  No audit entries recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              pageLogs.map((log: AuditLog & { user: ApiUser }) => (
                <TableRow key={log.id}>
                  <TableCell className={cn("font-medium whitespace-nowrap", text.subtle)}>
                    {formatDateTime(log.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className={cn("w-4 h-4 shrink-0", text.muted)} />
                      <span className={cn("font-medium", text.primary)}>{log.user?.name || log.user?.email}</span>
                      <span className={cn("text-xs", text.muted)}>({log.user?.role})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge tone={auditActionTone(log.action)}>{log.action}</StatusBadge>
                  </TableCell>
                  <TableCell>
                    <div className={cn("flex items-center gap-1.5", text.secondary)}>
                      <Activity className={cn("w-4 h-4 shrink-0", text.muted)} />
                      <span>{log.targetType}</span>
                      {log.targetId && <span className={text.muted}>#{log.targetId}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className={cn("flex items-start gap-1.5 text-sm truncate", text.muted)}>
                      <FileText className="w-4 h-4 mt-0.5 shrink-0" />
                      <span className="truncate">{log.details || "-"}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && logsData.length > PAGE_SIZE && (
        <div className="flex items-center justify-between pt-4">
          <p className={cn("text-sm", text.muted)}>
            Page {currentPage} of {totalPages} ({logsData.length} entries)
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </HubCard>
  );
}
