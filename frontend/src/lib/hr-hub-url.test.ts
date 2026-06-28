import { describe, expect, it } from "vitest";
import {
  buildHrLeaveUrl,
  buildHrPayrollUrl,
  buildHrShiftsUrl,
  parseHrLeaveSearchParams,
  parseHrPayrollSearchParams,
  parseHrShiftsSearchParams,
} from "./hr-hub-url";

describe("hr-hub-url", () => {
  it("builds payroll url with employee filter", () => {
    expect(buildHrPayrollUrl({ employee: 5 })).toBe("/hr/payroll?employee=5");
    expect(buildHrPayrollUrl()).toBe("/hr/payroll");
  });

  it("builds shifts url with employee and date", () => {
    expect(buildHrShiftsUrl({ employee: 3, date: "2026-06-28" })).toBe(
      "/hr/shifts?employee=3&date=2026-06-28",
    );
  });

  it("parses employee query param", () => {
    const params = new URLSearchParams("employee=12");
    expect(parseHrPayrollSearchParams(params).employeeId).toBe(12);
  });

  it("parses shifts search params", () => {
    const params = new URLSearchParams("employee=4&date=2026-06-28");
    const parsed = parseHrShiftsSearchParams(params);
    expect(parsed.employeeId).toBe(4);
    expect(parsed.date).toBe("2026-06-28");
  });

  it("builds and parses leave status filter", () => {
    expect(buildHrLeaveUrl({ status: "PENDING" })).toBe("/hr/leave?status=PENDING");
    const params = new URLSearchParams("status=APPROVED");
    expect(parseHrLeaveSearchParams(params).statusFilter).toBe("APPROVED");
  });
});
