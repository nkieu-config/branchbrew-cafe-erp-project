import { describe, expect, it } from "vitest";
import type { Shift } from "@/types/api";
import {
  filterShifts,
  groupShiftsByUserId,
  shiftStatusLabel,
  summarizeShifts,
} from "./shift-filters";

describe("shift-filters", () => {
  const today = new Date(2026, 5, 28, 12, 0, 0);
  const shifts = [
    {
      id: 1,
      userId: 10,
      branchId: 1,
      startTime: "2026-06-28T09:00:00",
      endTime: "2026-06-28T17:00:00",
      status: "SCHEDULED",
      user: { id: 10, name: "Alice", email: "a@test.com", role: "STAFF", branchId: 1 },
    },
    {
      id: 2,
      userId: 11,
      branchId: 1,
      startTime: "2026-06-28T10:00:00",
      endTime: "2026-06-28T18:00:00",
      status: "ABSENT",
      user: { id: 11, name: "Bob", email: "b@test.com", role: "STAFF", branchId: 1 },
    },
  ] as Shift[];

  it("labels shift statuses", () => {
    expect(shiftStatusLabel("SCHEDULED")).toBe("Scheduled");
    expect(shiftStatusLabel("CANCELLED")).toBe("Cancelled");
  });

  it("summarizes shift counts", () => {
    const summary = summarizeShifts(shifts);
    expect(summary.total).toBe(2);
    expect(summary.scheduled).toBe(1);
    expect(summary.absent).toBe(1);
  });

  it("groups by user id", () => {
    const rows = groupShiftsByUserId(shifts);
    expect(rows).toHaveLength(2);
    expect(rows[0]?.userId).toBe(10);
  });

  it("filters by employee and status", () => {
    const filtered = filterShifts(shifts, {
      date: today,
      statusFilter: "ABSENT",
      employeeId: null,
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.userId).toBe(11);
  });
});
