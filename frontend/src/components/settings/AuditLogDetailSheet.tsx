"use client";

import type { ReactNode } from "react";
import { Activity, FileText, History, User } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusBadge, auditActionTone } from "@/components/shared/status-badge";
import {
  type AuditLogRow,
  auditActionLabel,
  auditTargetTypeLabel,
  formatAuditDetails,
} from "@/lib/audit-filters";
import { roleLabel } from "@/lib/employee-filters";
import { formatDateTime } from "@/lib/intl-date";
import {
  expandedRowPanelClassName,
  settingsSheetContentClassName,
  text,
  typeHeadingClassName,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

type AuditLogDetailSheetProps = {
  log: AuditLogRow | null;
  open: boolean;
  onClose: () => void;
};

function DetailField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <dt className={cn("text-xs font-medium uppercase tracking-wide", text.muted)}>{label}</dt>
      <dd className={cn("text-sm", text.primary)}>{children}</dd>
    </div>
  );
}

export function AuditLogDetailSheet({ log, open, onClose }: AuditLogDetailSheetProps) {
  const details = formatAuditDetails(log?.details);

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <SheetContent
        className={settingsSheetContentClassName("w-full sm:max-w-lg overflow-y-auto")}
      >
        <SheetHeader className="mb-6 text-left">
          <SheetTitle className={typeHeadingClassName("text-xl flex items-center gap-2")}>
            <History className="w-5 h-5 text-[var(--hub-settings)]" aria-hidden />
            Audit entry
          </SheetTitle>
        </SheetHeader>

        {log && (
          <div className="space-y-6">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailField label="Timestamp">
                <span className="font-mono tabular-nums">{formatDateTime(log.createdAt)}</span>
              </DetailField>
              <DetailField label="Entry ID">
                <span className="tabular-nums">#{log.id}</span>
              </DetailField>
              <DetailField label="User">
                <span className="inline-flex items-center gap-2 min-w-0">
                  <User className="w-4 h-4 shrink-0 text-[var(--text-subtle)]" aria-hidden />
                  <span className="truncate">{log.user?.name || log.user?.email || "Unknown"}</span>
                </span>
                {log.user?.role && (
                  <span className={cn("block text-xs mt-1", text.muted)}>
                    {roleLabel(log.user.role)}
                  </span>
                )}
              </DetailField>
              <DetailField label="Action">
                <StatusBadge tone={auditActionTone(log.action)}>
                  {auditActionLabel(log.action)}
                </StatusBadge>
              </DetailField>
              <DetailField label="Target module">
                <span className="inline-flex items-center gap-2 min-w-0">
                  <Activity className="w-4 h-4 shrink-0 text-[var(--text-subtle)]" aria-hidden />
                  <span>{auditTargetTypeLabel(log.targetType)}</span>
                  {log.targetId != null && (
                    <span className={cn("tabular-nums", text.muted)}>#{log.targetId}</span>
                  )}
                </span>
              </DetailField>
            </dl>

            <div className={expandedRowPanelClassName("space-y-3")}>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--text-subtle)]" aria-hidden />
                <h3 className={typeHeadingClassName()}>Details</h3>
              </div>
              {details.isStructured ? (
                <pre
                  className={cn(
                    "overflow-x-auto rounded-lg border p-3 text-xs font-mono whitespace-pre-wrap break-words",
                    "border-[var(--table-row-border)] bg-[var(--form-line-bg)]",
                    text.secondary,
                  )}
                >
                  {details.display}
                </pre>
              ) : (
                <p className={cn("text-sm whitespace-pre-wrap break-words", text.secondary)}>
                  {details.display}
                </p>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
