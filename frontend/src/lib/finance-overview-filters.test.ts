import { describe, expect, it } from "vitest";
import type { Expense, Settlement } from "@/types/api";
import {
  filterExpenses,
  filterSettlements,
  settlementStatusLabel,
  summarizeFinanceOverview,
} from "./finance-overview-filters";

describe("finance-overview-filters", () => {
  const settlements = [
    {
      id: 1,
      branchId: 1,
      date: "2026-06-28",
      expectedCash: 1000,
      actualCash: 950,
      difference: -50,
      status: "PENDING",
      submittedById: 1,
      createdAt: "2026-06-28T18:00:00",
    },
    {
      id: 2,
      branchId: 1,
      date: "2026-06-27",
      expectedCash: 800,
      actualCash: 800,
      difference: 0,
      status: "APPROVED",
      submittedById: 1,
      createdAt: "2026-06-27T18:00:00",
    },
  ] as Settlement[];

  const expenses = [
    {
      id: 1,
      branchId: 1,
      amount: 120,
      category: "Supplies",
      description: "Receipt paper",
      recordedById: 1,
      recordedBy: { name: "Alice" },
      createdAt: "2026-06-28T10:00:00",
    },
  ] as Expense[];

  it("labels settlement statuses", () => {
    expect(settlementStatusLabel("PENDING")).toBe("Pending");
  });

  it("summarizes finance overview", () => {
    const summary = summarizeFinanceOverview(settlements, expenses);
    expect(summary.settlements).toBe(2);
    expect(summary.pending).toBe(1);
    expect(summary.approved).toBe(1);
    expect(summary.expenses).toBe(1);
    expect(summary.totalExpenseAmount).toBe(120);
    expect(summary.totalSettlementDiff).toBe(-50);
  });

  it("filters settlements and expenses", () => {
    expect(filterSettlements(settlements, "PENDING")).toHaveLength(1);
    expect(filterExpenses(expenses, "receipt")).toHaveLength(1);
    expect(filterExpenses(expenses, "travel")).toHaveLength(0);
  });
});
