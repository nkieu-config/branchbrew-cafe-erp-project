import type { Expense, Settlement, SettlementStatus } from "@/types/api";

export type SettlementStatusFilter = "ALL" | SettlementStatus;

export function settlementStatusLabel(status: SettlementStatus | string): string {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    default:
      return String(status).replace(/_/g, " ").toLowerCase();
  }
}

export function summarizeFinanceOverview(settlements: Settlement[], expenses: Expense[]) {
  let pending = 0;
  let approved = 0;
  let rejected = 0;
  let totalExpenseAmount = 0;
  let totalSettlementDiff = 0;

  for (const settlement of settlements) {
    switch (settlement.status) {
      case "PENDING":
        pending += 1;
        break;
      case "APPROVED":
        approved += 1;
        break;
      case "REJECTED":
        rejected += 1;
        break;
    }
    totalSettlementDiff += settlement.difference ?? 0;
  }

  for (const expense of expenses) {
    totalExpenseAmount += expense.amount ?? 0;
  }

  return {
    settlements: settlements.length,
    pending,
    approved,
    rejected,
    expenses: expenses.length,
    totalExpenseAmount,
    totalSettlementDiff,
  };
}

export function matchesSettlementStatusFilter(
  settlement: Settlement,
  filter: SettlementStatusFilter,
): boolean {
  return filter === "ALL" || settlement.status === filter;
}

export function filterSettlements(
  settlements: Settlement[],
  filter: SettlementStatusFilter,
): Settlement[] {
  return settlements.filter((settlement) => matchesSettlementStatusFilter(settlement, filter));
}

export function matchesExpenseSearch(expense: Expense, search: string): boolean {
  if (!search) return true;
  const haystack = [
    expense.category ?? "",
    expense.description ?? "",
    expense.recordedBy?.name ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(search);
}

export function filterExpenses(expenses: Expense[], search: string): Expense[] {
  return expenses.filter((expense) => matchesExpenseSearch(expense, search));
}
