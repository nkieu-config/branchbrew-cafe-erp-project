export type PayrollApprovedSnapshot = {
  payrollRunId: number;
  branchId: number | null;
  month: number;
  year: number;
  totalGross: number;
  totalNet: number;
  totalDeductions: number;
};

export function toPayrollApprovedSnapshot(input: {
  payrollRunId: number;
  branchId: number | null;
  month: number;
  year: number;
  totalGross: number;
  totalNet: number;
  totalDeductions: number;
}): PayrollApprovedSnapshot {
  return {
    payrollRunId: input.payrollRunId,
    branchId: input.branchId,
    month: input.month,
    year: input.year,
    totalGross: input.totalGross,
    totalNet: input.totalNet,
    totalDeductions: input.totalDeductions,
  };
}
