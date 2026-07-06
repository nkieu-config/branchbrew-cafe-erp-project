import type { PayrollRun, PayrollStatus, Payslip } from "@/types/api";

export type PayrollRunWithPayslips = PayrollRun & { payslips?: Payslip[] };

export type PayrollStatusFilter = "ALL" | PayrollStatus;

const MONTH_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

export function formatPayrollPeriod(month: number, year: number): string {
  return MONTH_FORMATTER.format(new Date(year, month - 1, 1));
}

export function payrollStatusLabel(status: PayrollStatus | string): string {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "APPROVED":
      return "Approved";
    case "PAID":
      return "Paid";
    default:
      return String(status).replace(/_/g, " ").toLowerCase();
  }
}

export function payrollRunPayslipCount(run: PayrollRunWithPayslips): number {
  return run.payslips?.length ?? 0;
}

export function payrollRunTotalNet(run: PayrollRunWithPayslips): number {
  return (run.payslips ?? []).reduce((sum, payslip) => sum + (payslip.netPay ?? 0), 0);
}

export function payrollRunTotalGross(run: PayrollRunWithPayslips): number {
  return (run.payslips ?? []).reduce((sum, payslip) => sum + (payslip.grossPay ?? 0), 0);
}

export function filterPayslipsForEmployee(
  payslips: Payslip[] | undefined,
  employeeId: number | null,
): Payslip[] {
  const list = payslips ?? [];
  if (employeeId == null) return list;
  return list.filter((payslip) => payslip.userId === employeeId);
}

export function runHasEmployeePayslip(
  run: PayrollRunWithPayslips,
  employeeId: number | null,
): boolean {
  if (employeeId == null) return true;
  return (run.payslips ?? []).some((payslip) => payslip.userId === employeeId);
}

export function summarizePayrollRuns(runs: PayrollRunWithPayslips[]) {
  let draft = 0;
  let approved = 0;
  let paid = 0;
  let totalNet = 0;
  let totalPayslips = 0;

  for (const run of runs) {
    switch (run.status) {
      case "DRAFT":
        draft += 1;
        break;
      case "APPROVED":
        approved += 1;
        break;
      case "PAID":
        paid += 1;
        break;
    }
    totalNet += payrollRunTotalNet(run);
    totalPayslips += payrollRunPayslipCount(run);
  }

  return {
    total: runs.length,
    draft,
    approved,
    paid,
    totalNet,
    totalPayslips,
  };
}

export function matchesPayrollStatusFilter(
  run: PayrollRunWithPayslips,
  filter: PayrollStatusFilter,
): boolean {
  return filter === "ALL" || run.status === filter;
}

export function filterPayrollRuns(
  runs: PayrollRunWithPayslips[],
  options: {
    statusFilter: PayrollStatusFilter;
    employeeId: number | null;
  },
): PayrollRunWithPayslips[] {
  return runs.filter(
    (run) =>
      matchesPayrollStatusFilter(run, options.statusFilter) &&
      runHasEmployeePayslip(run, options.employeeId),
  );
}

export function hasPayrollRunForMonth(
  runs: PayrollRunWithPayslips[],
  month: number,
  year: number,
): boolean {
  return runs.some((run) => run.month === month && run.year === year);
}

export function findDraftPayrollRun(
  runs: PayrollRunWithPayslips[],
): PayrollRunWithPayslips | undefined {
  return runs.find((run) => run.status === "DRAFT");
}
