import { describe, it, expect } from "vitest";
import {
  POINTS_PER_CURRENCY_UNIT,
  pointsToDiscountAmount,
} from "./loyalty";

describe("loyalty", () => {
  it("converts points to discount amount at the configured rate", () => {
    expect(POINTS_PER_CURRENCY_UNIT).toBe(10);
    expect(pointsToDiscountAmount(50)).toBe(5);
  });
});
