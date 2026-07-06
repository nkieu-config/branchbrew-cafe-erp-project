"use client";

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import { DataTable } from "@/components/shared/data-table";
import {
  ListMobileCard,
  PaginatedMobileList,
  ResponsiveDataTableLayout,
} from "@/components/shared/responsive-data-table";
import {
  type AttendanceRecordRow,
  isActiveRecord,
  isAttendanceLate,
} from "@/lib/filters/attendance-filters";
import { formatDate, formatTime } from "@/lib/intl-date";
import { useHubListPagination } from "@/hooks/useHubListPagination";
import {
  attendanceLateRowClassName,
  attendanceLateTimeClassName,
  attendanceOnTimeClassName,
  hrMutedMetaClassName,
} from "@/lib/theme/hub-hr";
import { text } from "@/lib/theme/surface";
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
  const emptyDescription = hasActiveFilters
    ? "No records match the current filters."
    : "Clock in to start tracking your attendance.";

  const listPagination = useHubListPagination(
    { pageSize: 10 },
    `${attendance.length}-${hasActiveFilters}`,
  );

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
          title: "In",
          dataIndex: "clockIn",
          key: "in",
          render: (val: string) => {
            const { isLate } = isAttendanceLate(val, shifts);
            return (
              <div className="flex items-center gap-2">
                <span className={isLate ? attendanceLateTimeClassName() : attendanceOnTimeClassName()}>
                  {formatTime(val)}
                </span>
                {isLate ? <span className={hrMutedMetaClassName("text-[var(--status-danger-fg)]")}>Late</span> : null}
              </div>
            );
          },
        },
        {
          title: "Out",
          dataIndex: "clockOut",
          key: "out",
          render: (val: string | null) =>
            val ? (
              <span className={cn("tabular-nums", text.secondary)}>{formatTime(val)}</span>
            ) : (
              <span className={text.muted}>Active</span>
            ),
        },
        {
          title: "Branch",
          dataIndex: ["branch", "name"],
          key: "branch",
          responsive: ["md"],
          render: (name: string) =>
            name ? (
              <span className={text.secondary}>{name}</span>
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
              <span className={cn("tabular-nums", text.primary)}>{val.toFixed(2)}</span>
            ) : isActiveRecord(record) ? (
              <span className={text.muted}>—</span>
            ) : (
              <span className={text.muted}>—</span>
            ),
        },
      ] as ColumnsType<AttendanceRecordRow>,
    [shifts],
  );

  const rowClassName = (record: AttendanceRecordRow) => {
    if (record.user?.role === "SUPER_ADMIN") return "";
    const { isLate } = isAttendanceLate(record.clockIn, shifts);
    return isLate ? attendanceLateRowClassName() : "";
  };

  return (
    <ResponsiveDataTableLayout
      mobile={
        isLoading ? (
          <ResponsiveDataTableLayout.Skeleton />
        ) : attendance.length === 0 ? (
          <ResponsiveDataTableLayout.Empty message={emptyDescription} />
        ) : (
          <PaginatedMobileList
            items={attendance}
            pageSize={listPagination.pageSize}
            page={listPagination.currentPage}
            onPageChange={listPagination.setCurrentPage}
          >
            {(record) => {
              const isLate =
                record.user?.role !== "SUPER_ADMIN" && isAttendanceLate(record.clockIn, shifts).isLate;

              return (
                <ListMobileCard
                  className={isLate ? attendanceLateRowClassName("cursor-default") : undefined}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <p className={cn("font-medium", text.primary)}>{formatDate(record.clockIn)}</p>
                    {record.totalHours != null && record.totalHours > 0 ? (
                      <span className={cn("shrink-0 tabular-nums text-sm font-medium", text.primary)}>
                        {record.totalHours.toFixed(2)}h
                      </span>
                    ) : null}
                  </div>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className={text.muted}>In</dt>
                      <dd className="flex items-center gap-2">
                        <span className={isLate ? attendanceLateTimeClassName() : attendanceOnTimeClassName()}>
                          {formatTime(record.clockIn)}
                        </span>
                        {isLate ? (
                          <span className={hrMutedMetaClassName("text-[var(--status-danger-fg)]")}>Late</span>
                        ) : null}
                      </dd>
                    </div>
                    <div>
                      <dt className={text.muted}>Out</dt>
                      <dd className={cn("tabular-nums", text.secondary)}>
                        {record.clockOut ? formatTime(record.clockOut) : "Active"}
                      </dd>
                    </div>
                  </dl>
                  {record.branch?.name ? (
                    <p className={cn("mt-2 text-sm", text.secondary)}>{record.branch.name}</p>
                  ) : null}
                </ListMobileCard>
              );
            }}
          </PaginatedMobileList>
        )
      }
      desktop={
        <DataTable
          hideBorders
          pagination={listPagination.tablePagination}
          columns={columns}
          dataSource={attendance}
          rowKey="id"
          loading={isLoading}
          emptyDescription={emptyDescription}
          rowClassName={rowClassName}
        />
      }
    />
  );
}
