import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildExpiryAlerts,
  buildLowStockAlerts,
  countExpiringBatches,
  countLowStockRecords,
  isExpiringBatch,
  isLowStockRecord,
} from "./inventory-alerts";

const NOW = new Date("2026-07-11T12:00:00.000Z");
const IN_ONE_DAY = "2026-07-12T12:00:00.000Z";
const IN_TWO_DAYS = "2026-07-13T12:00:00.000Z";
const IN_FIVE_DAYS = "2026-07-16T12:00:00.000Z";
const IN_THIRTY_DAYS = "2026-08-10T12:00:00.000Z";
const TWO_DAYS_AGO = "2026-07-09T12:00:00.000Z";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("isLowStockRecord", () => {
  it("treats out and low levels as alerts", () => {
    expect(isLowStockRecord({ stock: 0, minStock: 5 })).toBe(true);
    expect(isLowStockRecord({ stock: 3, minStock: 5 })).toBe(true);
    expect(isLowStockRecord({ stock: 6, minStock: 5 })).toBe(false);
  });
});

describe("countLowStockRecords", () => {
  it("counts all non-ok stock levels", () => {
    expect(
      countLowStockRecords([
        { id: 1, branchId: 1, ingredientId: 1, stock: 0, minStock: 5 },
        { id: 2, branchId: 1, ingredientId: 2, stock: 4, minStock: 5 },
        { id: 3, branchId: 1, ingredientId: 3, stock: 10, minStock: 5 },
      ]),
    ).toBe(2);
  });
});

describe("isExpiringBatch", () => {
  it("includes batches expiring within the warning window", () => {
    expect(
      isExpiringBatch({
        expiryDate: IN_TWO_DAYS,
        quantity: 1,
        status: "ACTIVE",
      }),
    ).toBe(true);
  });

  it("ignores batches beyond the warning window", () => {
    expect(
      isExpiringBatch({
        expiryDate: IN_THIRTY_DAYS,
        quantity: 1,
        status: "ACTIVE",
      }),
    ).toBe(false);
  });

  it("closes the window at the end of the seventh local day", () => {
    expect(
      isExpiringBatch({
        expiryDate: "2026-07-18T16:00:00.000Z",
        quantity: 1,
        status: "ACTIVE",
      }),
    ).toBe(true);

    expect(
      isExpiringBatch({
        expiryDate: "2026-07-18T20:00:00.000Z",
        quantity: 1,
        status: "ACTIVE",
      }),
    ).toBe(false);
  });
});

describe("countExpiringBatches", () => {
  it("counts only batches with quantity and valid status", () => {
    expect(
      countExpiringBatches([
        {
          id: 1,
          branchId: 1,
          ingredientId: 1,
          quantity: 2,
          status: "ACTIVE",
          expiryDate: IN_ONE_DAY,
        },
        {
          id: 2,
          branchId: 1,
          ingredientId: 2,
          quantity: 0,
          status: "ACTIVE",
          expiryDate: IN_ONE_DAY,
        },
      ]),
    ).toBe(1);
  });
});

describe("buildLowStockAlerts", () => {
  it("returns worst stock levels first up to the preview limit", () => {
    const alerts = buildLowStockAlerts(
      [
        { id: 1, branchId: 1, ingredientId: 1, stock: 2, minStock: 5, ingredient: { id: 1, name: "Sugar", unit: "kg" } },
        { id: 2, branchId: 1, ingredientId: 2, stock: 0, minStock: 5, ingredient: { id: 2, name: "Milk", unit: "L" } },
        { id: 3, branchId: 1, ingredientId: 3, stock: 10, minStock: 5, ingredient: { id: 3, name: "Flour", unit: "kg" } },
      ],
      "Main",
      1,
    );

    expect(alerts).toHaveLength(1);
    expect(alerts[0]?.ingredientName).toBe("Milk");
    expect(alerts[0]?.branchName).toBe("Main");
  });
});

describe("buildExpiryAlerts", () => {
  it("returns soonest expiry batches first", () => {
    const alerts = buildExpiryAlerts(
      [
        {
          id: 1,
          branchId: 1,
          ingredientId: 1,
          quantity: 2,
          status: "ACTIVE",
          expiryDate: IN_FIVE_DAYS,
          ingredient: { id: 1, name: "Cream", unit: "L" },
        },
        {
          id: 2,
          branchId: 1,
          ingredientId: 2,
          quantity: 1,
          status: "ACTIVE",
          expiryDate: IN_ONE_DAY,
          ingredient: { id: 2, name: "Butter", unit: "kg" },
        },
      ],
      "Main",
      2,
    );

    expect(alerts[0]?.ingredientName).toBe("Butter");
  });

  it("marks past-expiry batches as EXPIRED even when their status is stale ACTIVE", () => {
    const alerts = buildExpiryAlerts(
      [
        {
          id: 3,
          branchId: 1,
          ingredientId: 3,
          quantity: 250,
          status: "ACTIVE",
          expiryDate: TWO_DAYS_AGO,
          ingredient: { id: 3, name: "Oat Milk", unit: "ml" },
        },
      ],
      "Main",
    );

    expect(alerts[0]?.status).toBe("EXPIRED");
  });
});
