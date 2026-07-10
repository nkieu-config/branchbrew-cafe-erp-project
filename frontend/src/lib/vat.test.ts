import { inclusiveTaxAmount, parseVatRatePercent } from "./vat";

describe("vat", () => {
  it("computes inclusive VAT exactly, with no float tolerance", () => {
    expect(inclusiveTaxAmount(107, 7)).toBe(7);
    expect(inclusiveTaxAmount(1070, 7)).toBe(70);
  });

  it("rounds to 2dp half-up, matching the backend Decimal result", () => {
    expect(inclusiveTaxAmount(0.535, 7)).toBe(0.04);
    expect(inclusiveTaxAmount("107.00", "7")).toBe(7);
  });

  it("returns zero for non-positive inputs", () => {
    expect(inclusiveTaxAmount(0, 7)).toBe(0);
    expect(inclusiveTaxAmount(107, 0)).toBe(0);
  });

  it("parses rate from settings", () => {
    expect(parseVatRatePercent("7")).toBe(7);
    expect(parseVatRatePercent(undefined)).toBe(7);
  });
});
