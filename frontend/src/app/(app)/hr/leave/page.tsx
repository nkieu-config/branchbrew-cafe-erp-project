"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ColumnsType } from "antd/es/table";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  CalendarOff,
  CheckCircle,
  Clock,
  Loader2,
  Plus,
  XCircle,
} from "lucide-react";
import { HubPageHeader } from "@/components/shared/hub-card";
import { BranchEmptyState } from "@/components/shared/branch-empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { QueryErrorBanner } from "@/components/shared/query-error-banner";
import { StatusBadge, leaveStatusTone } from "@/components/shared/status-badge";
import { TableActionButton } from "@/components/shared/table-action-button";
import { HrHubLinks } from "@/components/hr/HrHubLinks";
import { RequestLeaveModal } from "@/components/hr/RequestLeaveModal";
import type { Branch, LeaveRequest, LeaveType } from "@/types/api";
import {
  useCreateLeave,
  useLeaveRequests,
  useUpdateLeaveStatus,
} from "@/hooks/domains/useHrQueries";
import { useBranches } from "@/hooks/domains/useGeneralQueries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatDate, formatDateRange } from "@/lib/intl-date";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";
import {
  type LeaveStatusFilter,
  type LeaveTypeFilter,
  filterLeaveRequests,
  leaveDurationDays,
  leaveStatusLabel,
  leaveTypeLabel,
  summarizeLeaveRequests,
} from "@/lib/leave-filters";
import { buildHrLeaveUrl, parseHrLeaveSearchParams } from "@/lib/hr-hub-url";
import {
  expandedRowPanelClassName,
  formSelectContentClassName,
  hrMetaBadgeClassName,
  hrSectionPanelClassName,
  hrSummaryChipClassName,
  hubCtaClassName,
  hubLoadingSpinnerClassName,
  infoBannerClassName,
  infoBannerIconClassName,
  infoBannerTextClassName,
  infoBannerTitleClassName,
  inlineLinkClassName,
  inventorySummaryStripClassName,
  leaveLegendSwatchClassName,
  listToolbarFieldClassName,
  metricValueClassName,
  tableActionAccentClassName,
  tableCellMutedClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

type LeaveConfirmAction = {
  id: number;
  type: "approve" | "reject";
  staffName: string;
  dateRange: string;
};

export default function LeaveRequestsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeBranchId, user } = useAuth();
  const role = user?.role;
  const isManagerOrAdmin = role === "SUPER_ADMIN" || role === "MANAGER";
  const branchIdNum = activeBranchId ? Number(activeBranchId) : undefined;

  const { data: branches = [] } = useBranches();
  const branchName = (branches as Branch[]).find((b) => b.id === branchIdNum)?.name;

  const initialStatus = parseHrLeaveSearchParams(searchParams).statusFilter;

  const {
    data: leaveRequests = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useLeaveRequests(branchIdNum, isManagerOrAdmin);

  const updateLeaveStatusMutation = useUpdateLeaveStatus();
  const createLeaveMutation = useCreateLeave();

  const [statusFilter, setStatusFilter] = useState<LeaveStatusFilter>(initialStatus);
  const [typeFilter, setTypeFilter] = useState<LeaveTypeFilter>("ALL");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase(), 300);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<LeaveConfirmAction | null>(null);

  useEffect(() => {
    setStatusFilter(parseHrLeaveSearchParams(searchParams).statusFilter);
  }, [searchParams]);

  const summary = useMemo(() => summarizeLeaveRequests(leaveRequests), [leaveRequests]);

  const filteredLeaveRequests = useMemo(
    () =>
      filterLeaveRequests(leaveRequests, {
        statusFilter,
        typeFilter,
        search: debouncedSearch,
      }),
    [leaveRequests, statusFilter, typeFilter, debouncedSearch],
  );

  const hasActiveFilters =
    statusFilter !== "ALL" || typeFilter !== "ALL" || search.trim().length > 0;

  const setStatusFilterAndUrl = useCallback(
    (next: LeaveStatusFilter) => {
      setStatusFilter(next);
      router.replace(
        buildHrLeaveUrl(next === "ALL" ? undefined : { status: next }),
        { scroll: false },
      );
    },
    [router],
  );

  const toggleStatusFilter = (next: LeaveStatusFilter) => {
    setStatusFilterAndUrl(statusFilter === next ? "ALL" : next);
  };

  const handleCreateLeave = async (payload: {
    type: string;
    startDate: string;
    endDate: string;
    reason: string;
  }) => {
    if (new Date(payload.startDate) > new Date(payload.endDate)) {
      toast.error("End date must be on or after start date");
      return;
    }
    try {
      await createLeaveMutation.mutateAsync(payload);
      toast.success("Leave requested successfully");
      setIsModalOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to request leave"));
    }
  };

  const handleConfirmStatusUpdate = async () => {
    if (!confirmAction) return;
    const status = confirmAction.type === "approve" ? "APPROVED" : "REJECTED";
    try {
      await updateLeaveStatusMutation.mutateAsync({ id: confirmAction.id, status });
      toast.success(`Leave ${status.toLowerCase()}`);
      setConfirmAction(null);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update leave status"));
    }
  };

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
                    <div className={cn("font-bold truncate", text.primary)}>
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
                          setConfirmAction({
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
                          setConfirmAction({
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
    [isManagerOrAdmin],
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

  if (!activeBranchId) {
    return (
      <BranchEmptyState description="Select a branch in the top bar to view and manage leave requests." />
    );
  }

  return (
    <>
      <div className="space-y-6">
        <HubPageHeader
          hideTitle
          icon={CalendarOff}
          accentHub="hr"
          description={
            isManagerOrAdmin
              ? "Review and approve team leave requests. Pending items also appear in the sidebar badge."
              : "Submit and track your leave requests. Approved leave is used for scheduling and payroll."
          }
          actions={
            <HrHubLinks current="leave" showOrgUsers={role === "SUPER_ADMIN"}>
              <Button
                className={hubCtaClassName("hr", "font-bold")}
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" aria-hidden />
                Request leave
              </Button>
            </HrHubLinks>
          }
        />

        <div className={hrSectionPanelClassName()}>
          {isManagerOrAdmin && summary.pending > 0 && initialStatus === "PENDING" && (
            <div className={infoBannerClassName()}>
              <div className="flex items-start gap-3">
                <Briefcase className={infoBannerIconClassName()} aria-hidden />
                <div>
                  <p className={infoBannerTitleClassName()}>Leave awaiting approval</p>
                  <p className={infoBannerTextClassName()}>
                    {summary.pending} request{summary.pending === 1 ? "" : "s"}{" "}
                    {summary.pending === 1 ? "needs" : "need"} your review at this branch.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !isError && (
            <div
              className={inventorySummaryStripClassName()}
              aria-live="polite"
              aria-atomic="true"
            >
              <span className={cn("font-semibold tabular-nums", text.primary)}>
                {summary.total > 0
                  ? `${summary.total} request${summary.total === 1 ? "" : "s"}`
                  : "No leave requests yet"}
              </span>
              {summary.pending > 0 && (
                <button
                  type="button"
                  className={hrSummaryChipClassName(
                    statusFilter === "PENDING",
                    metricValueClassName("amber"),
                  )}
                  onClick={() => toggleStatusFilter("PENDING")}
                >
                  {summary.pending} pending
                </button>
              )}
              {summary.approved > 0 && (
                <button
                  type="button"
                  className={hrSummaryChipClassName(
                    statusFilter === "APPROVED",
                    metricValueClassName("emerald"),
                  )}
                  onClick={() => toggleStatusFilter("APPROVED")}
                >
                  {summary.approved} approved
                </button>
              )}
              {summary.rejected > 0 && (
                <button
                  type="button"
                  className={hrSummaryChipClassName(
                    statusFilter === "REJECTED",
                    metricValueClassName("red"),
                  )}
                  onClick={() => toggleStatusFilter("REJECTED")}
                >
                  {summary.rejected} rejected
                </button>
              )}
              {isFetching && !isLoading && (
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

          {!isLoading && !isError && (
            <div
              className={cn(
                "flex flex-wrap items-center gap-x-4 gap-y-2 text-xs",
                "pb-3 border-b border-[var(--table-row-border)]",
              )}
              aria-label="Leave status legend"
            >
              {(
                [
                  ["PENDING", "Pending"],
                  ["APPROVED", "Approved"],
                  ["REJECTED", "Rejected"],
                ] as const
              ).map(([status, label]) => (
                <span
                  key={status}
                  className={cn("inline-flex items-center gap-1.5 font-medium", text.secondary)}
                >
                  <span className={leaveLegendSwatchClassName(status)} aria-hidden />
                  {label}
                </span>
              ))}
              <Link
                href="/hr/attendance"
                className={cn("inline-flex items-center gap-1 font-medium", inlineLinkClassName())}
              >
                <Clock className="w-3.5 h-3.5" aria-hidden />
                View attendance
              </Link>
            </div>
          )}

          {isError && (
            <QueryErrorBanner
              message={getErrorMessage(error, "Failed to load leave requests")}
              onRetry={() => void refetch()}
              loading={isFetching}
            />
          )}

          <ListToolbar
            search={isManagerOrAdmin ? search : undefined}
            onSearchChange={isManagerOrAdmin ? setSearch : undefined}
            searchPlaceholder="Search staff or reason…"
            branchName={branchName}
            showReset={hasActiveFilters}
            onReset={() => {
              setStatusFilterAndUrl("ALL");
              setTypeFilter("ALL");
              setSearch("");
            }}
            filters={
              <Select
                value={typeFilter}
                onValueChange={(value) => value && setTypeFilter(value as LeaveTypeFilter)}
              >
                <SelectTrigger
                  className={listToolbarFieldClassName("min-h-[44px] w-full sm:w-[180px]")}
                  aria-label="Filter by leave type"
                >
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent className={formSelectContentClassName()}>
                  <SelectItem value="ALL">All types</SelectItem>
                  <SelectItem value="SICK">Sick leave</SelectItem>
                  <SelectItem value="ANNUAL">Annual leave</SelectItem>
                  <SelectItem value="UNPAID">Unpaid leave</SelectItem>
                </SelectContent>
              </Select>
            }
          />

          <DataTable
            columns={columns}
            dataSource={filteredLeaveRequests}
            rowKey="id"
            loading={isLoading}
            pagination={{ pageSize: 10 }}
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
        </div>
      </div>

      <RequestLeaveModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateLeave}
        isSubmitting={createLeaveMutation.isPending}
      />

      <ConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={
          confirmAction?.type === "approve"
            ? "Approve this leave request?"
            : "Reject this leave request?"
        }
        description={
          confirmAction
            ? `${confirmAction.staffName} · ${confirmAction.dateRange}`
            : undefined
        }
        confirmLabel={confirmAction?.type === "approve" ? "Approve" : "Reject"}
        destructive={confirmAction?.type === "reject"}
        loading={updateLeaveStatusMutation.isPending}
        onConfirm={handleConfirmStatusUpdate}
      />
    </>
  );
}
