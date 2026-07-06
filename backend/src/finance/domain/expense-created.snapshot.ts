export type ExpenseCreatedSnapshot = {
  expenseId: number;
  branchId: number;
  amount: number;
  category: string;
};

export function toExpenseCreatedSnapshot(input: {
  expenseId: number;
  branchId: number;
  amount: number;
  category: string;
}): ExpenseCreatedSnapshot {
  return {
    expenseId: input.expenseId,
    branchId: input.branchId,
    amount: input.amount,
    category: input.category,
  };
}
