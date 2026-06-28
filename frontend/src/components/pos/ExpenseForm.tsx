import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { toast } from "sonner"
import { getErrorMessage } from '@/lib/errors'
import { useCreateExpense } from '@/hooks/domains/useFinanceQueries'
import { posExpenseIconClassName, posFormPanelClassName, posNativeInputClassName, text } from '@/lib/theme'
import { cn } from '@/lib/utils'

export function ExpenseForm({ branchIdNum }: { branchIdNum: number | undefined }) {
  const [expenseForm, setExpenseForm] = useState({ amount: "", category: "", description: "" })
  const createExpenseMutation = useCreateExpense();

  const formDisabled = createExpenseMutation.isPending;

  const handleExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!expenseForm.amount || !expenseForm.category || !branchIdNum) return
    try {
      await createExpenseMutation.mutateAsync({
        branchId: branchIdNum,
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category,
        description: expenseForm.description
      });
      toast.success("Petty cash expense recorded")
      setExpenseForm({ amount: "", category: "", description: "" })
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to record expense"))
    }
  }

  return (
    <div className={posFormPanelClassName()}>
      <div className="flex items-center gap-3">
        <Wallet className={`w-5 h-5 ${posExpenseIconClassName()}`} />
        <h2 className={`font-semibold text-lg ${text.primary}`}>Record Petty Cash Expense</h2>
      </div>
      <form onSubmit={handleExpense} className="flex flex-col gap-4">
        <div>
          <label className={`text-sm font-medium mb-1.5 block ${text.secondary}`}>Amount (THB)</label>
          <input 
            type="number"
            step="0.01"
            className={posNativeInputClassName("py-2 tabular-nums")}
            value={expenseForm.amount}
            onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
            required
            disabled={formDisabled}
            placeholder="e.g. 500"
          />
        </div>
        <div>
          <label className={`text-sm font-medium mb-1.5 block ${text.secondary}`}>Category</label>
          <select 
            className={posNativeInputClassName("py-2")}
            value={expenseForm.category}
            onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}
            required
            disabled={formDisabled}
          >
            <option value="" disabled>Select category…</option>
            <option value="SUPPLIES">Store Supplies (Ice, Cups)</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="UTILITIES">Utilities</option>
            <option value="MISC">Miscellaneous</option>
          </select>
        </div>
        <div>
          <label className={`text-sm font-medium mb-1.5 block ${text.secondary}`}>Description</label>
          <input 
            type="text"
            className={posNativeInputClassName("py-2")}
            value={expenseForm.description}
            onChange={e => setExpenseForm({...expenseForm, description: e.target.value})}
            placeholder="e.g. Bought 3 bags of ice"
            disabled={formDisabled}
          />
        </div>
        <Button
          type="submit"
          className={cn("w-full mt-2 min-h-[44px]")}
          variant="outline"
          disabled={formDisabled}
        >
          {createExpenseMutation.isPending ? "Recording…" : "Record Expense"}
        </Button>
      </form>
    </div>
  )
}
