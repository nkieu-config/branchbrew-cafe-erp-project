import { describe, expect, it } from "vitest";
import {
  payrollDeductionClassName,
  payrollNetPayClassName,
  payrollOtMetricClassName,
} from "./hub-hr";

describe("payroll metric tones", () => {
  it("uses blue for OT and red only for deductions", () => {
    expect(payrollOtMetricClassName()).toContain("--metric-blue");
    expect(payrollDeductionClassName()).toContain("--metric-red");
    expect(payrollNetPayClassName()).toContain("--metric-emerald");
    expect(payrollOtMetricClassName()).not.toContain("--metric-amber");
  });
});
