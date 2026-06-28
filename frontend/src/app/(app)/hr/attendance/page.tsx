"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnsType } from "antd/es/table";
import { useAuth } from "@/context/AuthContext";
import {
  useActiveClockIn,
  useAttendance,
  useClockIn,
  useClockOut,
  useMyShifts,
} from "@/hooks/domains/useHrQueries";
import { useBranches } from "@/hooks/domains/useGeneralQueries";
import {
  AlertCircle,
  CalendarDays,
  Clock,
  Loader2,
  PlayCircle,
  StopCircle,
} from "lucide-react";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";
import { HubPageHeader } from "@/components/shared/hub-card";
import { BranchEmptyState } from "@/components/shared/branch-empty-state";
import { DataTable } from "@/components/shared/data-table";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { QueryErrorBanner } from "@/components/shared/query-error-banner";
import { StatusBadge } from "@/components/shared/status-badge";
import { HrHubLinks } from "@/components/hr/HrHubLinks";
import { Button } from "@/components/ui/button";
import type { Branch, Shift } from "@/types/api";
import { formatDate, formatTime } from "@/lib/intl-date";
import {
  type AttendanceRecordRow,
  type AttendanceStatusFilter,
  filterAttendance,
  isActiveRecord,
  isAttendanceLate,
  summarizeAttendance,
} from "@/lib/attendance-filters";
import {
  attendanceLateRowClassName,
  attendanceLateTimeClassName,
  attendanceLegendSwatchClassName,
  attendanceOnTimeClassName,
  hubCtaClassName,
  hubLoadingSpinnerClassName,
  hrSectionPanelClassName,
  hrSummaryChipClassName,
  infoBannerClassName,
  infoBannerIconClassName,
  infoBannerTextClassName,
  infoBannerTitleClassName,
  inlineLinkClassName,
  inventorySummaryStripClassName,
  listToolbarFieldClassName,
  metricValueClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

function useElapsedTimer(clockIn: string | undefined | null) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (!clockIn) {
      setElapsed("");
      return;
    }

    const start = new Date(clockIn).getTime();
    const tick = () => {
      const diff = Date.now() - start;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setElapsed(
        `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`,
      );
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [clockIn]);

  return elapsed;
}

export default function AttendancePage() {
  const { user, activeBranchId } = useAuth();
  const role = user?.role;
  const branchIdNum = activeBranchId ? Number(activeBranchId) : undefined;

  const { data: branches = [] } = useBranches();
  const branchName = (branches as Branch[]).find((b) => b.id === branchIdNum)?.name;

  const {
    data: attendanceData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAttendance();
  const { data: shiftsData } = useMyShifts();
  const {
    data: activeClockIn,
    isLoading: loadingActive,
    isFetching: fetchingActive,
  } = useActiveClockIn();
  const clockInMutation = useClockIn();
  const clockOutMutation = useClockOut();

  const [statusFilter, setStatusFilter] = useState<AttendanceStatusFilter>("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const attendance = (attendanceData ?? []) as AttendanceRecordRow[];
  const shifts = (shiftsData ?? []) as Shift[];
  const isClockedIn = Boolean(activeClockIn);
  const elapsed = useElapsedTimer(isClockedIn ? activeClockIn?.clockIn : null);

  const startDateObj = startDate ? new Date(`${startDate}T00:00:00`) : null;
  const endDateObj = endDate ? new Date(`${endDate}T00:00:00`) : null;

  const summary = useMemo(
    () => summarizeAttendance(attendance, shifts),
    [attendance, shifts],
  );

  const filteredAttendance = useMemo(
    () =>
      filterAttendance(attendance, {
        statusFilter,
        startDate: startDateObj,
        endDate: endDateObj,
        shifts,
      }),
    [attendance, statusFilter, startDateObj, endDateObj, shifts],
  );

  const hasActiveFilters =
    statusFilter !== "ALL" || startDate.length > 0 || endDate.length > 0;

  const toggleStatusFilter = (next: AttendanceStatusFilter) => {
    setStatusFilter((current) => (current === next ? "ALL" : next));
  };

  const handleClockIn = async () => {
    if (!activeBranchId) {
      toast.error("Please select a branch before clocking in.");
      return;
    }
    try {
      await clockInMutation.mutateAsync(Number(activeBranchId));
      toast.success("Clocked in successfully!");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to clock in"));
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOutMutation.mutateAsync();
      toast.success("Clocked out successfully!");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to clock out"));
    }
  };

  const needsBranchForClockIn = role === "SUPER_ADMIN" && !activeBranchId;
  const clockActionPending = clockInMutation.isPending || clockOutMutation.isPending;

  const columns = useMemo(
    () =>
      [
        {
          title: "Date",
          dataIndex: "clockIn",
          key: "date",
          render: (val: string) => (
            <span className={cn("font-medium", text.primary)}>{formatDate(val)}</span>
          ),
        },
        {
          title: "Clock In",
          dataIndex: "clockIn",
          key: "in",
          render: (val: string) => {
            const { isLate, lateMinutes, shift } = isAttendanceLate(val, shifts);
            return (
              <div className="flex items-center gap-2">
                <span
                  className={
                    isLate ? attendanceLateTimeClassName() : attendanceOnTimeClassName()
                  }
                >
                  {formatTime(val)}
                </span>
                {isLate && shift && (
                  <span
                    title={`Late by ${lateMinutes} min — shift started ${formatTime(shift.startTime)}`}
                  >
                    <StatusBadge tone="danger" className="gap-1">
                      <AlertCircle className="w-3 h-3" aria-hidden />
                      Late
                    </StatusBadge>
                  </span>
                )}
              </div>
            );
          },
        },
        {
          title: "Clock Out",
          dataIndex: "clockOut",
          key: "out",
          render: (val: string | null) =>
            val ? (
              <span className={cn("font-mono font-medium tabular-nums", text.subtle)}>
                {formatTime(val)}
              </span>
            ) : (
              <StatusBadge tone="info" className="animate-pulse motion-reduce:animate-none">
                Active
              </StatusBadge>
            ),
        },
        {
          title: "Branch",
          dataIndex: ["branch", "name"],
          key: "branch",
          responsive: ["md"],
          render: (name: string) =>
            name ? (
              <StatusBadge tone="category">{name}</StatusBadge>
            ) : (
              <span className={text.muted}>—</span>
            ),
        },
        {
          title: "Hours",
          dataIndex: "totalHours",
          key: "hours",
          align: "right" as const,
          render: (val: number | null, record: AttendanceRecordRow) =>
            val != null && val > 0 ? (
              <span className={cn("font-bold tabular-nums", text.primary)}>
                {val.toFixed(2)} hrs
              </span>
            ) : isActiveRecord(record) ? (
              <span className={cn("text-xs font-medium", text.muted)}>In progress</span>
            ) : (
              <span className={text.muted}>—</span>
            ),
        },
      ] as ColumnsType<AttendanceRecordRow>,
    [shifts],
  );

  if (!activeBranchId) {
    return (
      <BranchEmptyState description="Select a branch in the top bar to clock in and view attendance records." />
    );
  }

  return (
    <div className="space-y-6">
      <HubPageHeader
        hideTitle
        icon={Clock}
        accentHub="hr"
        description="Track your clock-in/out history. Late arrivals are flagged when you clock in more than 15 minutes after a scheduled shift."
        actions={
          <HrHubLinks current="attendance" showOrgUsers={role === "SUPER_ADMIN"}>
            {isClockedIn ? (
              <Button
                variant="destructive"
                className={cn(hubCtaClassName("hr", "font-bold"), "shadow-sm")}
                disabled={clockActionPending || loadingActive}
                onClick={() => void handleClockOut()}
              >
                {clockOutMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin motion-reduce:animate-none" aria-hidden />
                ) : (
                  <StopCircle className="w-4 h-4 mr-2" aria-hidden />
                )}
                Clock out
              </Button>
            ) : (
              <Button
                className={hubCtaClassName("hr", "font-bold")}
                disabled={needsBranchForClockIn || clockActionPending || loadingActive}
                onClick={() => void handleClockIn()}
              >
                {clockInMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin motion-reduce:animate-none" aria-hidden />
                ) : (
                  <PlayCircle className="w-4 h-4 mr-2" aria-hidden />
                )}
                Clock in
              </Button>
            )}
          </HrHubLinks>
        }
      />

      <div className={hrSectionPanelClassName()}>
        {isClockedIn && activeClockIn && (
          <div className={infoBannerClassName()}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3 min-w-0">
                <Clock className={infoBannerIconClassName()} aria-hidden />
                <div className="min-w-0">
                  <p className={infoBannerTitleClassName()}>Currently clocked in</p>
                  <p className={infoBannerTextClassName()}>
                    Started {formatTime(activeClockIn.clockIn)} at{" "}
                    {activeClockIn.branch?.name ?? branchName ?? "this branch"}
                    {elapsed && (
                      <>
                        {" "}
                        ·{" "}
                        <span className="font-mono tabular-nums font-semibold text-[var(--status-info-fg)]">
                          {elapsed}
                        </span>{" "}
                        elapsed
                      </>
                    )}
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="shrink-0 min-h-[44px] font-semibold"
                disabled={clockActionPending}
                onClick={() => void handleClockOut()}
              >
                <StopCircle className="w-4 h-4 mr-2" aria-hidden />
                Clock out
              </Button>
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
                ? `${summary.total} record${summary.total === 1 ? "" : "s"} · last 30 days`
                : "No attendance records yet"}
            </span>
            {summary.active > 0 && (
              <button
                type="button"
                className={hrSummaryChipClassName(
                  statusFilter === "active",
                  metricValueClassName("blue"),
                )}
                onClick={() => toggleStatusFilter("active")}
              >
                {summary.active} active
              </button>
            )}
            {summary.late > 0 && (
              <button
                type="button"
                className={hrSummaryChipClassName(
                  statusFilter === "late",
                  metricValueClassName("red"),
                )}
                onClick={() => toggleStatusFilter("late")}
              >
                {summary.late} late
              </button>
            )}
            {summary.onTime > 0 && (
              <button
                type="button"
                className={hrSummaryChipClassName(
                  statusFilter === "on-time",
                  metricValueClassName("emerald"),
                )}
                onClick={() => toggleStatusFilter("on-time")}
              >
                {summary.onTime} on time
              </button>
            )}
            {summary.totalHours > 0 && (
              <span className={cn("tabular-nums font-medium", text.secondary)}>
                {summary.totalHours.toFixed(1)} hrs logged
              </span>
            )}
            {(isFetching || fetchingActive) && !isLoading && (
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
            aria-label="Attendance status legend"
          >
            {(
              [
                ["on-time", "On time"],
                ["late", "Late"],
                ["active", "Active session"],
              ] as const
            ).map(([variant, label]) => (
              <span
                key={variant}
                className={cn("inline-flex items-center gap-1.5 font-medium", text.secondary)}
              >
                <span className={attendanceLegendSwatchClassName(variant)} aria-hidden />
                {label}
              </span>
            ))}
            <Link
              href="/hr/shifts"
              className={cn("inline-flex items-center gap-1 font-medium", inlineLinkClassName())}
            >
              <CalendarDays className="w-3.5 h-3.5" aria-hidden />
              View shifts
            </Link>
          </div>
        )}

        {isError && (
          <QueryErrorBanner
            message={getErrorMessage(error, "Failed to load attendance records")}
            onRetry={() => void refetch()}
            loading={isFetching}
          />
        )}

        <ListToolbar
          branchName={branchName}
          showReset={hasActiveFilters}
          onReset={() => {
            setStatusFilter("ALL");
            setStartDate("");
            setEndDate("");
          }}
          filters={
            <>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className={listToolbarFieldClassName("min-h-[44px] w-full sm:w-[160px]")}
                aria-label="From date"
              />
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className={listToolbarFieldClassName("min-h-[44px] w-full sm:w-[160px]")}
                aria-label="To date"
              />
            </>
          }
        />

        <DataTable
          columns={columns}
          dataSource={filteredAttendance}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          emptyDescription={
            hasActiveFilters
              ? "No records match the current filters."
              : "Clock in to start tracking your attendance."
          }
          rowClassName={(record: AttendanceRecordRow) => {
            if (record.user?.role === "SUPER_ADMIN") return "";
            const { isLate } = isAttendanceLate(record.clockIn, shifts);
            return isLate ? attendanceLateRowClassName() : "";
          }}
        />
      </div>
    </div>
  );
}
