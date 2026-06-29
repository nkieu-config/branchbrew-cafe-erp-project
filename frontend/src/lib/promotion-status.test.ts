import { describe, expect, it } from "vitest";
import {
  formatPromoValidityRange,
  getPromoValidity,
  isDuplicatePromoCodeError,
  promoValidityLabel,
  toDateInputValue,
} from "./promotion-status";
import type { Promotion } from "@/types/api";

function promo(overrides: Partial<Promotion> = {}): Promotion {
  return {
    id: 1,
    code: "TEST",
    description: "Test",
    discountType: "PERCENTAGE",
    discountValue: 10,
    isActive: true,
    ...overrides,
  };
}

describe("getPromoValidity", () => {
  it("returns expired when end date is in the past", () => {
    const result = getPromoValidity(
      promo({ endDate: "2020-01-01T00:00:00.000Z" }),
      new Date("2024-06-01"),
    );
    expect(result).toBe("expired");
  });

  it("returns scheduled when start date is in the future", () => {
    const result = getPromoValidity(
      promo({ startDate: "2099-01-01T00:00:00.000Z" }),
      new Date("2024-06-01"),
    );
    expect(result).toBe("scheduled");
  });

  it("returns inactive when toggled off", () => {
    expect(getPromoValidity(promo({ isActive: false }))).toBe("inactive");
  });

  it("returns active for live promos", () => {
    expect(getPromoValidity(promo())).toBe("active");
  });
});

describe("promoValidityLabel", () => {
  it("maps validity to labels", () => {
    expect(promoValidityLabel("active")).toBe("Active");
    expect(promoValidityLabel("expired")).toBe("Expired");
  });
});

describe("isDuplicatePromoCodeError", () => {
  it("detects duplicate code messages", () => {
    expect(isDuplicatePromoCodeError("A promotion with this code already exists")).toBe(true);
    expect(isDuplicatePromoCodeError("Network error")).toBe(false);
  });
});

describe("toDateInputValue", () => {
  it("formats ISO dates for date inputs", () => {
    expect(toDateInputValue("2024-06-15T12:00:00.000Z")).toBe("2024-06-15");
    expect(toDateInputValue(null)).toBe("");
  });
});

describe("formatPromoValidityRange", () => {
  it("formats start and end dates", () => {
    const range = formatPromoValidityRange(
      promo({
        startDate: "2024-06-01T00:00:00.000Z",
        endDate: "2024-06-30T23:59:59.999Z",
      }),
    );
    expect(range).toContain("–");
  });

  it("returns em dash when no dates", () => {
    expect(formatPromoValidityRange(promo())).toBe("—");
  });
});
