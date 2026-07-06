import { PayrollApprovedSnapshot } from '../domain/payroll-approved.snapshot';

export class PayrollApprovedEvent {
  constructor(public readonly payload: PayrollApprovedSnapshot) {}

  get payrollRunId(): number {
    return this.payload.payrollRunId;
  }

  get branchId(): number | null {
    return this.payload.branchId;
  }

  get month(): number {
    return this.payload.month;
  }

  get year(): number {
    return this.payload.year;
  }

  get totalGross(): number {
    return this.payload.totalGross;
  }

  get totalNet(): number {
    return this.payload.totalNet;
  }

  get totalDeductions(): number {
    return this.payload.totalDeductions;
  }
}
