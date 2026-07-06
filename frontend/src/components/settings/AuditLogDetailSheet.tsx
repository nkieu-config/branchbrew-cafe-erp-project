"use client";

import type { ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  type AuditLogRow,
  auditActionLabel,
  auditTargetTypeLabel,
  formatAuditDetails,
} from "@/lib/filters/audit-filters";
import { roleLabel } from "@/lib/filters/employee-filters";
import { formatDateTime } from "@/lib/intl-date";
import { settingsMutedMetaClassName, settingsSheetContentClassName } from "@/lib/theme/settings-hub-chrome";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName } from "@/lib/theme/typography";
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
    <div className="space-y-0.5">
      <dt className={settingsMutedMetaClassName("text-xs")}>{label}</dt>
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
        <SheetHeader className="mb-4 text-left">
          <SheetTitle className={typeHeadingClassName("text-lg")}>Audit entry</SheetTitle>
        </SheetHeader>

        {log && (
          <div className="space-y-6">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailField label="Time">
                <span className="tabular-nums">{formatDateTime(log.createdAt)}</span>
              </DetailField>
              <DetailField label="Action">
                {auditActionLabel(log.action)}
              </DetailField>
              <DetailField label="User">
                <span className="truncate block">
                  {log.user?.name || log.user?.email || "Unknown"}
                </span>
                {log.user?.role && (
                  <span className={settingsMutedMetaClassName("block text-xs mt-0.5")}>
                    {roleLabel(log.user.role)}
                  </span>
                )}
              </DetailField>
              <DetailField label="Module">
                {auditTargetTypeLabel(log.targetType)}
                {log.targetId != null && (
                  <span className={text.muted}> #{log.targetId}</span>
                )}
              </DetailField>
            </dl>

            <div className="border-t border-[var(--table-row-border)] pt-4 space-y-2">
              <h3 className={cn("text-sm font-medium", text.secondary)}>Details</h3>
              {details.isStructured ? (
                <pre
                  className={cn(
                    "overflow-x-auto rounded-lg border border-[var(--table-row-border)] p-3 text-xs font-mono whitespace-pre-wrap break-words",
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
