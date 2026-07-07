"use client";

import type { ColumnsType } from "antd/es/table";
import { DataTable } from "@/components/shared/data-table";
import {
  ListMobileCard,
  PaginatedMobileList,
  ResponsiveDataTableLayout,
} from "@/components/shared/responsive-data-table";
import { formatDateTime } from "@/lib/intl-date";
import { formatCurrency } from "@/lib/money";
import { tableCellMutedClassName } from "@/lib/theme/feedback";
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

const expenseColumns: ColumnsType<Expense> = [
  {
    title: "Date",
    key: "date",
    render: (_: unknown, expense: Expense) => (
      <span className={cn("tabular-nums whitespace-nowrap", tableCellMutedClassName())}>
        {formatDateTime(expense.createdAt)}
      </span>
    ),
  },
  {
    title: "Category",
    key: "category",
    render: (_: unknown, expense: Expense) => (
      <span className={cn("font-medium", text.primary)}>{expense.category}</span>
    ),
  },
  {
    title: "Description",
    key: "description",
    render: (_: unknown, expense: Expense) => (
      <span className={tableCellMutedClassName()}>{expense.description?.trim() || "—"}</span>
    ),
  },
  {
    title: "Amount",
    key: "amount",
    align: "right",
    render: (_: unknown, expense: Expense) => (
      <span className={financeExpenseAmountClassName()}>-{formatCurrency(expense.amount)}</span>
    ),
  },
  {
    title: "By",
    key: "recordedBy",
    render: (_: unknown, expense: Expense) => (
      <span className={tableCellMutedClassName()}>{expense.recordedBy?.name ?? "—"}</span>
    ),
  },
];

export function ExpensesTable({ expenses, loading, expenseSearch }: ExpensesTableProps) {
  const emptyMessage = expenseEmptyMessage(expenseSearch);

  return (
    <div className="flex min-w-0 flex-col" data-testid="finance-expenses">
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
          <DataTable<Expense>
            columns={expenseColumns}
            dataSource={expenses}
            rowKey="id"
            loading={loading}
            pagination={false}
            emptyDescription={emptyMessage}
          />
        }
      />
    </div>
  );
}
