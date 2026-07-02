import { describe, expect, it } from "vitest";
import { validateShiftFields } from "./create-shift-validation";

const base = {
  userId: "1",
  shiftDate: "2026-06-15",
  startTime: "09:00",
  endTime: "17:00",
  hasStaffOptions: true,
};

describe("validateShiftFields", () => {
  it("returns no errors for a valid shift", () => {
    expect(validateShiftFields(base)).toEqual({});
  });

  it("requires employee when staff options exist", () => {
    expect(validateShiftFields({ ...base, userId: "" }).employee).toBe("Employee is required");
  });

  it("skips employee requirement when there are no staff options", () => {
    expect(validateShiftFields({ ...base, userId: "", hasStaffOptions: false })).toEqual({});
  });

  it("requires date, start, and end times", () => {
    expect(validateShiftFields({ ...base, shiftDate: "" }).date).toBe("Date is required");
    expect(validateShiftFields({ ...base, startTime: "" }).startTime).toBe("Start time is required");
    expect(validateShiftFields({ ...base, endTime: "" }).endTime).toBe("End time is required");
  });

  it("rejects end time on or before start time", () => {
    const errors = validateShiftFields({ ...base, endTime: "09:00" });
    expect(errors.endTime).toBe("End time must be after start time");
  });

  it("rejects end time before start time on the same day", () => {
    const errors = validateShiftFields({ ...base, startTime: "14:00", endTime: "13:00" });
    expect(errors.endTime).toBe("End time must be after start time");
  });

  it("flags invalid date/time combinations", () => {
    const errors = validateShiftFields({
      ...base,
      shiftDate: "not-a-date",
    });
    expect(errors.date).toBe("Invalid date or time");
  });
});
