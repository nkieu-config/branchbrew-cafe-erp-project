import { describe, expect, it } from "vitest";
import type { PayrollRun, Payslip } from "@/types/api";
import {
  filterPayrollRuns,
  filterPayslipsForEmployee,
  formatPayrollPeriod,
  hasPayrollRunForMonth,
  payrollRunTotalNet,
  payrollStatusLabel,
  summarizePayrollRuns,
} from "./payroll-filters";

describe("payroll-filters", () => {
  const payslips = [
    { id: 1, payrollRunId: 1, userId: 10, netPay: 15000, grossPay: 18000 },
    { id: 2, payrollRunId: 1, userId: 11, netPay: 12000, grossPay: 14000 },
  ] as Payslip[];

  const runs = [
    {
      id: 1,
      month: 6,
      year: 2026,
      status: "DRAFT",
      branchId: 1,
      payslips,
    },
    {
      id: 2,
      month: 5,
      year: 2026,
      status: "APPROVED",
      branchId: 1,
      payslips: [{ id: 3, payrollRunId: 2, userId: 10, netPay: 10000, grossPay: 12000 }],
    },
  ] as PayrollRun[];

  it("formats payroll period labels", () => {
    expect(formatPayrollPeriod(6, 2026)).toMatch(/June 2026/);
    expect(payrollStatusLabel("DRAFT")).toBe("Draft");
  });

  it("summarizes payroll runs", () => {
    const summary = summarizePayrollRuns(runs);
    expect(summary.total).toBe(2);
    expect(summary.draft).toBe(1);
    expect(summary.approved).toBe(1);
    expect(summary.totalPayslips).toBe(3);
    expect(summary.totalNet).toBe(37000);
  });

  it("calculates run totals and filters", () => {
    expect(payrollRunTotalNet(runs[0])).toBe(27000);
    expect(filterPayslipsForEmployee(payslips, 10)).toHaveLength(1);

    const draftOnly = filterPayrollRuns(runs, {
      statusFilter: "DRAFT",
      employeeId: null,
    });
    expect(draftOnly).toHaveLength(1);

    const employeeRuns = filterPayrollRuns(runs, {
      statusFilter: "ALL",
      employeeId: 11,
    });
    expect(employeeRuns).toHaveLength(1);
  });

  it("detects existing month run", () => {
    expect(hasPayrollRunForMonth(runs, 6, 2026)).toBe(true);
    expect(hasPayrollRunForMonth(runs, 7, 2026)).toBe(false);
  });
});
