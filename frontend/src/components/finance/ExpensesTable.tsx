"use client";

import { FinanceTableSkeleton } from "@/components/finance/FinanceTableSkeleton";
import {
  ListMobileCard,
  PaginatedMobileList,
  ResponsiveDataTableLayout,
} from "@/components/shared/responsive-data-table";
import { formatDateTime } from "@/lib/intl-date";
import { formatCurrency } from "@/lib/money";
import {
  horizontalScrollHintClassName,
  nativeTableBodyClassName,
  nativeTableCellMutedClassName,
  nativeTableCellPrimaryClassName,
  nativeTableClassName,
  nativeTableEmptyCellClassName,
  nativeTableHeadClassName,
  nativeTableRowClassName,
} from "@/lib/theme/data-table";
import { financeExpenseAmountClassName, financeSectionLabelClassName } from "@/lib/theme/finance";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";
import type { Expense } from "@/types/api";

type ExpensesTableProps = {
  expenses: Expense[];
  loading: boolean;
  expenseSearch: string;
};

function expenseEmptyMessage(search: string) {
  return search.trim()
    ? "No expenses match your search."
    : "No petty cash expenses recorded.";
}

export function ExpensesTable({ expenses, loading, expenseSearch }: ExpensesTableProps) {
  const emptyMessage = expenseEmptyMessage(expenseSearch);

  return (
    <div className="flex min-w-0 flex-col">
      <h2 className={financeSectionLabelClassName()}>Expenses</h2>

      <ResponsiveDataTableLayout
        mobile={
          loading ? (
            <ResponsiveDataTableLayout.Skeleton rows={3} />
          ) : expenses.length === 0 ? (
            <ResponsiveDataTableLayout.Empty message={emptyMessage} />
          ) : (
            <PaginatedMobileList items={expenses} pageSize={0}>
              {(expense) => (
                <ListMobileCard>
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={cn("font-medium", text.primary)}>{expense.category}</p>
                      <time
                        className={cn("text-xs tabular-nums", text.muted)}
                        dateTime={expense.createdAt}
                      >
                        {formatDateTime(expense.createdAt)}
                      </time>
                    </div>
                    <span className={financeExpenseAmountClassName("shrink-0")}>
                      -{formatCurrency(expense.amount)}
                    </span>
                  </div>
                  {expense.description?.trim() ? (
                    <p className={cn("mb-2 line-clamp-2 text-sm", text.secondary)}>
                      {expense.description}
                    </p>
                  ) : null}
                  <p className={cn("text-xs", text.muted)}>{expense.recordedBy?.name ?? "—"}</p>
                </ListMobileCard>
              )}
            </PaginatedMobileList>
          )
        }
        desktop={
          loading ? (
            <FinanceTableSkeleton />
          ) : (
            <div className={horizontalScrollHintClassName()}>
              <table className={nativeTableClassName()}>
                <thead className={nativeTableHeadClassName()}>
                  <tr>
                    <th className="rounded-l-lg px-3 py-2.5">Date</th>
                    <th className="px-3 py-2.5">Category</th>
                    <th className="px-3 py-2.5">Description</th>
                    <th className="px-3 py-2.5 text-right">Amount</th>
                    <th className="rounded-r-lg px-3 py-2.5">By</th>
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
                      <td className={cn("px-3 py-2.5 text-right", financeExpenseAmountClassName())}>
                        -{formatCurrency(expense.amount)}
                      </td>
                      <td className={nativeTableCellMutedClassName()}>
                        {expense.recordedBy?.name ?? "—"}
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan={5} className={nativeTableEmptyCellClassName()}>
                        {emptyMessage}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )
        }
      />
    </div>
  );
}
