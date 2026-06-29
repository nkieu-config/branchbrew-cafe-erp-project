"use client";

import { DollarSign } from "lucide-react";
import { FinanceTableSkeleton } from "@/components/finance/FinanceTableSkeleton";
import { formatDateTime } from "@/lib/intl-date";
import { formatBaht } from "@/lib/money";
import {
  nativeTableBodyClassName,
  nativeTableCellMutedClassName,
  nativeTableCellPrimaryClassName,
  nativeTableClassName,
  nativeTableEmptyCellClassName,
  nativeTableHeadClassName,
  nativeTableRowClassName,
} from "@/lib/theme/data-table";
import { financeExpenseAmountClassName, financeMetricIconClassName, financeSectionPanelClassName, financeSectionTitleClassName } from "@/lib/theme/finance";
import type { Expense } from "@/types/api";

type ExpensesTableProps = {
  expenses: Expense[];
  loading: boolean;
  expenseSearch: string;
};

export function ExpensesTable({ expenses, loading, expenseSearch }: ExpensesTableProps) {
  return (
    <div className={financeSectionPanelClassName("flex flex-col")}>
      <h2 className={financeSectionTitleClassName()}>
        <DollarSign className={financeMetricIconClassName("amber")} aria-hidden />
        Petty cash expenses
      </h2>
      <div className="overflow-x-auto">
        {loading ? (
          <FinanceTableSkeleton />
        ) : (
          <table className={nativeTableClassName()}>
            <thead className={nativeTableHeadClassName()}>
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Date</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 rounded-r-lg">By</th>
              </tr>
            </thead>
            <tbody className={nativeTableBodyClassName()}>
              {expenses.map((expense) => (
                <tr key={expense.id} className={nativeTableRowClassName()}>
                  <td className={nativeTableCellMutedClassName()}>
                    {formatDateTime(expense.createdAt)}
                  </td>
                  <td className={nativeTableCellPrimaryClassName()}>{expense.category}</td>
                  <td className={nativeTableCellMutedClassName()}>
                    {expense.description?.trim() || "—"}
                  </td>
                  <td className={financeExpenseAmountClassName()}>
                    -{formatBaht(expense.amount)}
                  </td>
                  <td className={nativeTableCellMutedClassName()}>
                    {expense.recordedBy?.name ?? "—"}
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className={nativeTableEmptyCellClassName()}>
                    {expenseSearch.trim()
                      ? "No expenses match your search."
                      : "No petty cash expenses recorded."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
