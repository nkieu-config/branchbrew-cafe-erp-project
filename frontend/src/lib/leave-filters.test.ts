import { describe, expect, it } from "vitest";
import type { LeaveRequest } from "@/types/api";
import {
  filterLeaveRequests,
  leaveDurationDays,
  leaveStatusLabel,
  leaveTypeLabel,
  summarizeLeaveRequests,
} from "./leave-filters";

describe("leave-filters", () => {
  const requests = [
    {
      id: 1,
      userId: 10,
      type: "SICK",
      startDate: "2026-06-28",
      endDate: "2026-06-30",
      status: "PENDING",
      reason: "Flu",
      user: { id: 10, name: "Alice", email: "a@test.com", role: "STAFF", branchId: 1 },
    },
    {
      id: 2,
      userId: 11,
      type: "ANNUAL",
      startDate: "2026-07-01",
      endDate: "2026-07-05",
      status: "APPROVED",
      user: { id: 11, name: "Bob", email: "b@test.com", role: "STAFF", branchId: 1 },
    },
  ] as LeaveRequest[];

  it("labels leave types and statuses", () => {
    expect(leaveTypeLabel("SICK")).toBe("Sick leave");
    expect(leaveStatusLabel("PENDING")).toBe("Pending");
  });

  it("calculates inclusive leave duration", () => {
    expect(leaveDurationDays("2026-06-28", "2026-06-30")).toBe(3);
    expect(leaveDurationDays("2026-07-01", "2026-07-01")).toBe(1);
  });

  it("summarizes leave portfolio", () => {
    const summary = summarizeLeaveRequests(requests);
    expect(summary.total).toBe(2);
    expect(summary.pending).toBe(1);
    expect(summary.approved).toBe(1);
    expect(summary.sick).toBe(1);
  });

  it("filters by status, type, and search", () => {
    const pending = filterLeaveRequests(requests, {
      statusFilter: "PENDING",
      typeFilter: "ALL",
      search: "",
    });
    expect(pending).toHaveLength(1);

    const alice = filterLeaveRequests(requests, {
      statusFilter: "ALL",
      typeFilter: "ALL",
      search: "alice",
    });
    expect(alice).toHaveLength(1);
  });
});
