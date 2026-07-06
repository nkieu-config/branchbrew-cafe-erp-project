import { describe, it, expect } from "vitest";
import { toNumber, formatMoney, formatCurrency, formatQuantity } from "./money";

describe("money", () => {
  it("coerces decimal strings from API", () => {
    expect(toNumber("85.0000")).toBe(85);
    expect(toNumber(null)).toBe(0);
  });

  it("formats currency safely", () => {
    expect(formatCurrency("60.5")).toMatch(/60\.50/);
    expect(formatMoney(1000)).toBe("1,000.00");
  });

  it("formats quantities with grouping, decimals, and units", () => {
    expect(formatQuantity(10000)).toBe("10,000.00");
    expect(formatQuantity("2500", { unit: "g" })).toBe("2,500.00 g");
    expect(formatQuantity(168, { decimals: 1 })).toBe("168.0");
    expect(formatQuantity(null, { decimals: 1 })).toBe("0.0");
  });
});
