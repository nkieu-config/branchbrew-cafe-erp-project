"use client";

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import { AlertCircle } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  type AttendanceRecordRow,
  isActiveRecord,
  isAttendanceLate,
} from "@/lib/attendance-filters";
import { formatDate, formatTime } from "@/lib/intl-date";
import { hubListDataTableProps } from "@/lib/theme/data-table";
import {
  attendanceLateRowClassName,
  attendanceLateTimeClassName,
  attendanceOnTimeClassName,
} from "@/lib/theme/hub-hr";
import { text } from "@/lib/theme/surface";
import { typeUiLabelClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";
import type { Shift } from "@/types/api";

type AttendanceTableProps = {
  attendance: AttendanceRecordRow[];
  shifts: Shift[];
  isLoading: boolean;
  hasActiveFilters: boolean;
};

export function AttendanceTable({
  attendance,
  shifts,
  isLoading,
  hasActiveFilters,
}: AttendanceTableProps) {
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
              <span className={typeUiLabelClassName(cn("tabular-nums", text.primary))}>
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

  return (
    <DataTable
      {...hubListDataTableProps({ pageSize: 10 })}
      columns={columns}
      dataSource={attendance}
      rowKey="id"
      loading={isLoading}
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
  );
}
