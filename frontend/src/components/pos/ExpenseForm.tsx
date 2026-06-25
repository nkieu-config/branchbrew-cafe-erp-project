import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { toast } from "sonner"
import { getErrorMessage } from '@/lib/errors'
import { useCreateExpense } from '@/hooks/domains/useFinanceQueries'

export function ExpenseForm({ branchIdNum }: { branchIdNum: number | undefined }) {
  const [expenseForm, setExpenseForm] = useState({ amount: "", category: "", description: "" })
  const createExpenseMutation = useCreateExpense();

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
    <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6">
      <div className="flex items-center gap-3 text-amber-500">
        <Wallet className="w-5 h-5" />
        <h2 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Record Petty Cash Expense</h2>
      </div>
      <form onSubmit={handleExpense} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Amount (THB)</label>
          <input 
            type="number"
            step="0.01"
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:border-emerald-500 transition-colors tabular-nums"
            value={expenseForm.amount}
            onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
            required
            placeholder="e.g. 500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Category</label>
          <select 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:border-emerald-500 transition-colors"
            value={expenseForm.category}
            onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}
            required
          >
            <option value="" disabled>Select category...</option>
            <option value="SUPPLIES">Store Supplies (Ice, Cups)</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="UTILITIES">Utilities</option>
            <option value="MISC">Miscellaneous</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Description</label>
          <input 
            type="text"
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:border-emerald-500 transition-colors"
            value={expenseForm.description}
            onChange={e => setExpenseForm({...expenseForm, description: e.target.value})}
            placeholder="e.g. Bought 3 bags of ice"
          />
        </div>
        <Button type="submit" className="w-full mt-2" variant="outline">
          Record Expense
        </Button>
      </form>
    </div>
  )
}
