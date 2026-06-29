"use client";

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import { CheckCircle, XCircle } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge, leaveStatusTone } from "@/components/shared/status-badge";
import { TableActionButton } from "@/components/shared/table-action-button";
import {
  leaveDurationDays,
  leaveStatusLabel,
  leaveTypeLabel,
} from "@/lib/leave-filters";
import { formatDate, formatDateRange } from "@/lib/intl-date";
import { hubListDataTableProps } from "@/lib/theme/data-table";
import { tableCellMutedClassName } from "@/lib/theme/feedback";
import { expandedRowPanelClassName, tableActionAccentClassName } from "@/lib/theme/hub-primitives";
import { hrMetaBadgeClassName } from "@/lib/theme/hub-hr";
import { text } from "@/lib/theme/surface";
import { typeUiLabelClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";
import type { LeaveRequest, LeaveType } from "@/types/api";

export type LeaveConfirmAction = {
  id: number;
  type: "approve" | "reject";
  staffName: string;
  dateRange: string;
};

type LeaveRequestsTableProps = {
  leaveRequests: LeaveRequest[];
  isManagerOrAdmin: boolean;
  isLoading: boolean;
  hasActiveFilters: boolean;
  onConfirmAction: (action: LeaveConfirmAction) => void;
};

export function LeaveRequestsTable({
  leaveRequests,
  isManagerOrAdmin,
  isLoading,
  hasActiveFilters,
  onConfirmAction,
}: LeaveRequestsTableProps) {
  const columns = useMemo(
    () =>
      [
        ...(isManagerOrAdmin
          ? [
              {
                title: "Staff",
                key: "staff",
                render: (_: unknown, req: LeaveRequest) => (
                  <div className="min-w-0">
                    <div className={typeUiLabelClassName(cn("truncate", text.primary))}>
                      {req.user?.name ?? `Employee #${req.userId}`}
                    </div>
                    {req.user?.email && (
                      <div className={cn("text-xs truncate", tableCellMutedClassName())}>
                        {req.user.email}
                      </div>
                    )}
                  </div>
                ),
              },
            ]
          : []),
        {
          title: "Type",
          dataIndex: "type",
          key: "type",
          render: (type: LeaveType) => (
            <span className={hrMetaBadgeClassName()}>{leaveTypeLabel(type)}</span>
          ),
        },
        {
          title: "Dates",
          key: "dates",
          render: (_: unknown, req: LeaveRequest) => {
            const days = leaveDurationDays(req.startDate, req.endDate);
            return (
              <div className="min-w-0">
                <div className={cn("font-medium", text.primary)}>
                  {formatDateRange(req.startDate, req.endDate)}
                </div>
                <div className={cn("text-xs tabular-nums", text.muted)}>
                  {days} day{days === 1 ? "" : "s"}
                </div>
              </div>
            );
          },
        },
        {
          title: "Reason",
          dataIndex: "reason",
          key: "reason",
          responsive: ["lg"],
          render: (reason: string | null | undefined) =>
            reason?.trim() ? (
              <span className={cn("line-clamp-2 text-sm", text.subtle)}>{reason}</span>
            ) : (
              <span className={text.muted}>—</span>
            ),
        },
        {
          title: "Status",
          dataIndex: "status",
          key: "status",
          render: (status: string) => (
            <StatusBadge tone={leaveStatusTone(status)}>{leaveStatusLabel(status)}</StatusBadge>
          ),
        },
        {
          title: "Submitted",
          dataIndex: "createdAt",
          key: "submitted",
          responsive: ["md"],
          render: (createdAt: string | undefined) =>
            createdAt ? (
              <span className={cn("text-sm", text.muted)}>{formatDate(createdAt)}</span>
            ) : (
              <span className={text.muted}>—</span>
            ),
        },
        ...(isManagerOrAdmin
          ? [
              {
                title: "Actions",
                key: "actions",
                align: "right" as const,
                width: 96,
                render: (_: unknown, req: LeaveRequest) =>
                  req.status === "PENDING" ? (
                    <div className="flex justify-end gap-1">
                      <TableActionButton
                        icon={CheckCircle}
                        label={`Approve leave for ${req.user?.name ?? "employee"}`}
                        iconOnly
                        onClick={() =>
                          onConfirmAction({
                            id: req.id,
                            type: "approve",
                            staffName: req.user?.name ?? "Employee",
                            dateRange: formatDateRange(req.startDate, req.endDate),
                          })
                        }
                        className={tableActionAccentClassName("emerald")}
                      />
                      <TableActionButton
                        icon={XCircle}
                        label={`Reject leave for ${req.user?.name ?? "employee"}`}
                        iconOnly
                        onClick={() =>
                          onConfirmAction({
                            id: req.id,
                            type: "reject",
                            staffName: req.user?.name ?? "Employee",
                            dateRange: formatDateRange(req.startDate, req.endDate),
                          })
                        }
                        destructive
                      />
                    </div>
                  ) : null,
              },
            ]
          : []),
      ] as ColumnsType<LeaveRequest>,
    [isManagerOrAdmin, onConfirmAction],
  );

  const expandedRowRender = (record: LeaveRequest) => (
    <div className={expandedRowPanelClassName()}>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <dt className={cn("text-xs font-medium uppercase tracking-wide", text.muted)}>Reason</dt>
          <dd className={cn("mt-1", text.primary)}>{record.reason?.trim() || "—"}</dd>
        </div>
        <div>
          <dt className={cn("text-xs font-medium uppercase tracking-wide", text.muted)}>
            Duration
          </dt>
          <dd className={cn("mt-1 tabular-nums font-medium", text.primary)}>
            {leaveDurationDays(record.startDate, record.endDate)} day
            {leaveDurationDays(record.startDate, record.endDate) === 1 ? "" : "s"}
          </dd>
        </div>
      </dl>
    </div>
  );

  return (
    <DataTable
      {...hubListDataTableProps({ pageSize: 10 })}
      columns={columns}
      dataSource={leaveRequests}
      rowKey="id"
      loading={isLoading}
      emptyDescription={
        hasActiveFilters
          ? "No leave requests match the current filters."
          : isManagerOrAdmin
            ? "No leave requests for this branch yet."
            : "Submit a leave request to get started."
      }
      expandable={{
        expandedRowRender,
        rowExpandable: (record) => Boolean(record.reason?.trim()),
      }}
    />
  );
}
