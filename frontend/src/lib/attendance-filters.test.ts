import { describe, expect, it } from "vitest";
import type { Shift } from "@/types/api";
import {
  ATTENDANCE_LATE_THRESHOLD_MINUTES,
  filterAttendance,
  isActiveRecord,
  isAttendanceLate,
  summarizeAttendance,
} from "./attendance-filters";

describe("attendance-filters", () => {
  const shift: Shift = {
    id: 1,
    userId: 10,
    branchId: 1,
    startTime: "2026-06-28T09:00:00",
    endTime: "2026-06-28T17:00:00",
    status: "SCHEDULED",
  };

  const records = [
    {
      id: 1,
      clockIn: "2026-06-28T09:05:00",
      clockOut: "2026-06-28T17:00:00",
      totalHours: 7.9,
      branch: { id: 1, name: "Main" },
    },
    {
      id: 2,
      clockIn: "2026-06-28T09:30:00",
      clockOut: null,
      totalHours: null,
      branch: { id: 1, name: "Main" },
    },
    {
      id: 3,
      clockIn: "2026-06-27T08:55:00",
      clockOut: "2026-06-27T16:00:00",
      totalHours: 7.1,
      branch: { id: 1, name: "Main" },
    },
  ];

  it("detects late clock-ins against scheduled shift", () => {
    const onTime = isAttendanceLate("2026-06-28T09:05:00", [shift]);
    expect(onTime.isLate).toBe(false);

    const late = isAttendanceLate("2026-06-28T09:30:00", [shift]);
    expect(late.isLate).toBe(true);
    expect(late.lateMinutes).toBeGreaterThan(ATTENDANCE_LATE_THRESHOLD_MINUTES);
  });

  it("summarizes attendance portfolio", () => {
    const summary = summarizeAttendance(records, [shift]);
    expect(summary.total).toBe(3);
    expect(summary.active).toBe(1);
    expect(summary.late).toBe(1);
    expect(summary.onTime).toBe(2);
    expect(summary.totalHours).toBeCloseTo(15, 0);
  });

  it("filters by status and date range", () => {
    const activeOnly = filterAttendance(records, {
      statusFilter: "active",
      startDate: null,
      endDate: null,
      shifts: [shift],
    });
    expect(activeOnly).toHaveLength(1);
    expect(isActiveRecord(activeOnly[0])).toBe(true);

    const june28 = filterAttendance(records, {
      statusFilter: "ALL",
      startDate: new Date(2026, 5, 28),
      endDate: new Date(2026, 5, 28),
      shifts: [shift],
    });
    expect(june28).toHaveLength(2);
  });
});
