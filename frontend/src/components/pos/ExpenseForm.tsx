import { useState } from "react";
import { Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errors";
import { useCreateExpense } from "@/hooks/domains/useFinanceQueries";
import {
  posFormFieldLabelClassName,
  posFormPanelClassName,
  posFormPanelHeaderClassName,
  posFormPanelIconClassName,
  posNativeInputClassName,
  posPanelTopDividerClassName,
  posSecondaryActionClassName,
} from "@/lib/theme/immersive";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";

export function ExpenseForm({ branchIdNum }: { branchIdNum: number | undefined }) {
  const [expenseForm, setExpenseForm] = useState({ amount: "", category: "", description: "" });
  const createExpenseMutation = useCreateExpense();

  const formDisabled = createExpenseMutation.isPending;

  const handleExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.amount || !expenseForm.category || !branchIdNum) return;
    try {
      await createExpenseMutation.mutateAsync({
        branchId: branchIdNum,
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category,
        description: expenseForm.description,
      });
      toast.success("Petty cash expense recorded");
      setExpenseForm({ amount: "", category: "", description: "" });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to record expense"));
    }
  };

  return (
    <div className={posFormPanelClassName()}>
      <div className={posFormPanelHeaderClassName()}>
        <div className={posFormPanelIconClassName("expense")}>
          <Wallet className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h2 className={typeHeadingClassName("text-lg")}>Petty Cash Expense</h2>
        </div>
      </div>

      <form onSubmit={handleExpense} className="flex flex-col gap-4">
        <div>
          <label htmlFor="expense-amount" className={posFormFieldLabelClassName()}>
            Amount
          </label>
          <input
            id="expense-amount"
            type="number"
            step="0.01"
            className={posNativeInputClassName("py-2.5 tabular-nums text-lg font-semibold")}
            value={expenseForm.amount}
            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
            required
            disabled={formDisabled}
            placeholder="e.g. 500"
          />
        </div>
        <div>
          <label htmlFor="expense-category" className={posFormFieldLabelClassName()}>
            Category
          </label>
          <select
            id="expense-category"
            className={posNativeInputClassName("py-2.5")}
            value={expenseForm.category}
            onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
            required
            disabled={formDisabled}
          >
            <option value="" disabled>
              Select category…
            </option>
            <option value="SUPPLIES">Store Supplies (Ice, Cups)</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="UTILITIES">Utilities</option>
            <option value="MISC">Miscellaneous</option>
          </select>
        </div>
        <div>
          <label htmlFor="expense-description" className={posFormFieldLabelClassName()}>
            Description
          </label>
          <input
            id="expense-description"
            type="text"
            className={posNativeInputClassName("py-2.5")}
            value={expenseForm.description}
            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
            placeholder="e.g. Bought 3 bags of ice"
            disabled={formDisabled}
          />
        </div>
        <Button
          type="submit"
          variant="outline"
          className={cn(posSecondaryActionClassName(), posPanelTopDividerClassName(), "mt-1 pt-4")}
          disabled={formDisabled}
        >
          {createExpenseMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin motion-reduce:animate-none" aria-hidden />
              Recording…
            </>
          ) : (
            "Record Expense"
          )}
        </Button>
      </form>
    </div>
  );
}
