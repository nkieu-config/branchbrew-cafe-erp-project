import { describe, expect, it } from "vitest";
import { validateLeaveFields } from "./request-leave-validation";

const base = {
  leaveType: "ANNUAL",
  startDate: "2026-07-01",
  endDate: "2026-07-05",
  reason: "Family trip",
};

describe("validateLeaveFields", () => {
  it("returns no errors for valid leave request", () => {
    expect(validateLeaveFields(base)).toEqual({});
  });

  it("requires all fields", () => {
    expect(validateLeaveFields({ ...base, leaveType: "" }).type).toBe("Leave type is required");
    expect(validateLeaveFields({ ...base, startDate: "" }).startDate).toBe("Start date is required");
    expect(validateLeaveFields({ ...base, endDate: "" }).endDate).toBe("End date is required");
    expect(validateLeaveFields({ ...base, reason: "   " }).reason).toBe("Reason is required");
  });

  it("rejects end date before start date", () => {
    const errors = validateLeaveFields({
      ...base,
      startDate: "2026-07-10",
      endDate: "2026-07-05",
    });
    expect(errors.endDate).toBe("End date must be on or after start date");
  });

  it("allows same-day leave", () => {
    expect(
      validateLeaveFields({
        ...base,
        startDate: "2026-07-01",
        endDate: "2026-07-01",
      }),
    ).toEqual({});
  });
});
