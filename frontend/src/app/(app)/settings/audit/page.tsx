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
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
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
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  No audit entries recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              pageLogs.map((log: AuditLog & { user: ApiUser }) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-medium">{log.user?.name || log.user?.email}</span>
                      <span className="text-xs text-slate-400">({log.user?.role})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge tone={auditActionTone(log.action)}>{log.action}</StatusBadge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Activity className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{log.targetType}</span>
                      {log.targetId && <span className="text-slate-400">#{log.targetId}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="flex items-start gap-1.5 text-sm text-slate-500 dark:text-slate-400 truncate">
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
          <p className="text-sm text-slate-500">
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
