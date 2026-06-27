"use client";

import { useAuth } from "@/context/AuthContext";
import { useAttendance, useShifts, useActiveClockIn, useClockIn, useClockOut } from "@/hooks/domains/useHrQueries";
import { Tooltip } from "antd";
import { Clock, AlertCircle, PlayCircle, StopCircle } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";
import { HubCard } from "@/components/shared/hub-card";
import { BranchEmptyState } from "@/components/shared/branch-empty-state";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { User, Shift } from "@/types/api";
import { formatDate, formatTime, formatDateTimeSeconds } from "@/lib/intl-date";
import { isSameDay, differenceInMinutes } from "date-fns";
import {
  attendanceLateRowClassName,
  attendanceLateTimeClassName,
  attendanceOnTimeClassName,
  hubCtaClassName,
  hubPrimaryActionClassName,
  text,
} from "@/lib/theme";

interface AttendanceRecord {
  id: number;
  clockIn: string;
  clockOut?: string | null;
  user?: User;
}

export default function AttendancePage() {
  const { user, activeBranchId } = useAuth();
  const { data: attendanceData, isLoading: loadingAtt } = useAttendance();
  const { data: shiftsData, isLoading: loadingShifts } = useShifts(
    activeBranchId ? "EMPLOYEE" : undefined,
    activeBranchId ?? undefined,
  );

  const { data: activeClockIn, isLoading: loadingActive } = useActiveClockIn();
  const clockInMutation = useClockIn();
  const clockOutMutation = useClockOut();

  const attendance = attendanceData || [];
  const shifts = shiftsData || [];
  const isLoading = loadingAtt || loadingShifts || loadingActive;

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

  const columns = [
    {
      title: "Date",
      dataIndex: "clockIn",
      key: "date",
      render: (val: string) => (
        <span className={`font-medium ${text.primary}`}>
          {formatDate(val)}
        </span>
      ),
    },
    {
      title: "Clock In",
      dataIndex: "clockIn",
      key: "in",
      render: (val: string) => {
        const clockInDate = new Date(val);
        const dayShift = shifts.find((s: Shift) => isSameDay(new Date(s.startTime), clockInDate));

        let isLate = false;
        let lateMinutes = 0;

        if (dayShift) {
          const shiftStart = new Date(dayShift.startTime);
          lateMinutes = differenceInMinutes(clockInDate, shiftStart);
          if (lateMinutes > 15) {
            isLate = true;
          }
        }

        return (
          <div className="flex items-center gap-2">
            <span className={isLate ? attendanceLateTimeClassName() : attendanceOnTimeClassName()}>
              {formatDateTimeSeconds(val)}
            </span>
            {isLate && dayShift && (
              <Tooltip
                title={`Late by ${lateMinutes} minutes (Shift started at ${formatTime(dayShift.startTime)})`}
              >
                <span>
                  <StatusBadge tone="danger" className="gap-1">
                    <AlertCircle className="w-3 h-3" /> LATE
                  </StatusBadge>
                </span>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: "Clock Out",
      dataIndex: "clockOut",
      key: "out",
      render: (val: string) =>
        val ? (
          <span className={`font-mono font-medium ${text.subtle}`}>
            {formatDateTimeSeconds(val)}
          </span>
        ) : (
          <StatusBadge tone="info" className="animate-pulse motion-reduce:animate-none">
            Active
          </StatusBadge>
        ),
    },
    {
      title: "Total Hours",
      dataIndex: "totalHours",
      key: "hours",
      align: "right" as const,
      render: (val: number) =>
        val ? (
          <span className="font-bold">{val.toFixed(2)} hrs</span>
        ) : (
          <span className={text.muted}>-</span>
        ),
    },
  ];

  if (!activeBranchId) {
    return (
      <BranchEmptyState description="Select a branch in the top bar to clock in and view attendance records." />
    );
  }

  return (
    <HubCard
      title="My Attendance Records"
      icon={Clock}
      actions={
        activeClockIn?.active ? (
          <Button
            variant="destructive"
            className="h-10 px-6 rounded-xl font-bold tracking-wide shadow-sm"
            disabled={clockOutMutation.isPending}
            onClick={() => void handleClockOut()}
          >
            <StopCircle className="w-5 h-5 mr-2" />
            Clock Out
          </Button>
        ) : (
          <Button
            className={hubPrimaryActionClassName("h-10 px-6 rounded-xl font-bold tracking-wide")}
            disabled={(!activeBranchId && user?.role === "SUPER_ADMIN") || clockInMutation.isPending}
            onClick={() => void handleClockIn()}
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            Clock In
          </Button>
        )
      }
    >
      <DataTable
        columns={columns}
        dataSource={attendance}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        rowClassName={(record: AttendanceRecord) => {
          if (record.user?.role === "SUPER_ADMIN") return "";
          const clockInDate = new Date(record.clockIn);
          const dayShift = shifts.find((s: Shift) => isSameDay(new Date(s.startTime), clockInDate));
          if (dayShift) {
            const lateMinutes = differenceInMinutes(clockInDate, new Date(dayShift.startTime));
            if (lateMinutes > 15) return attendanceLateRowClassName();
          }
          return "";
        }}
      />
    </HubCard>
  );
}
