"use client"

import { useState, useEffect } from "react"
import { AnimatedPage } from "@/components/animated-page"
import { getExpectedCash, submitSettlement, createExpense } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Calculator, Wallet } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function SettlementPage() {
  const [expected, setExpected] = useState<any>(null)
  const [actualCash, setActualCash] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const { activeBranchId } = useAuth()

  const [expenseForm, setExpenseForm] = useState({ amount: "", category: "", description: "" })

  useEffect(() => {
    if (activeBranchId) {
      fetchExpected()
    }
  }, [activeBranchId])

  const fetchExpected = async () => {
    if (!activeBranchId) return;
    try {
      const data = await getExpectedCash(activeBranchId)
      setExpected(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettlement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!actualCash || !activeBranchId) return
    try {
      await submitSettlement(activeBranchId, parseFloat(actualCash))
      alert("Settlement submitted successfully for HQ approval.")
      setActualCash("")
    } catch (error: any) {
      alert(error.message || "Failed to submit settlement")
    }
  }

  const handleExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!expenseForm.amount || !expenseForm.category || !activeBranchId) return
    try {
      await createExpense(activeBranchId, {
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category,
        description: expenseForm.description
      })
      alert("Expense recorded.")
      setExpenseForm({ amount: "", category: "", description: "" })
      fetchExpected() // Refresh expected cash to reflect new expense
    } catch (error: any) {
      alert("Failed to record expense")
    }
  }

  return (
    <AnimatedPage className="max-w-[1200px] w-full mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 text-balance">End of Day Settlement</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Reconcile cash drawer and submit to HQ.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Settlement Form */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6">
          <div className="flex items-center gap-3 text-emerald-500">
            <Calculator className="w-5 h-5" />
            <h2 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Submit Cash Drawer</h2>
          </div>
          
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Total Sales (Cash):</span>
              <span className="font-medium tabular-nums">฿{expected?.sales?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500">
              <span>Total Petty Cash Expenses:</span>
              <span className="font-medium tabular-nums text-red-500">-฿{expected?.expenses?.toLocaleString() || 0}</span>
            </div>
            <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-semibold">
              <span className="text-slate-900 dark:text-slate-100">Expected Cash in Drawer:</span>
              <span className="text-blue-500 tabular-nums">฿{expected?.expectedCash?.toLocaleString() || 0}</span>
            </div>
          </div>

          <form onSubmit={handleSettlement} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Actual Cash Counted</label>
              <input 
                type="number"
                step="0.01"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-lg font-medium tabular-nums"
                value={actualCash}
                onChange={e => setActualCash(e.target.value)}
                required
                placeholder="e.g. 5500"
              />
            </div>
            <Button type="submit" className="w-full py-6 mt-2 bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-600 text-white border-0 shadow-lg">
              Submit Shift Settlement
            </Button>
          </form>
        </div>

        {/* Expense Form */}
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
                min="0.01"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 transition-colors"
                value={expenseForm.amount}
                onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Category</label>
              <select 
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 transition-colors"
                value={expenseForm.category}
                onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}
                required
              >
                <option value="">Select Category...</option>
                <option value="Ice">Ice / Water</option>
                <option value="Supplies">Store Supplies (Bags, Tissue)</option>
                <option value="Maintenance">Urgent Maintenance</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Description</label>
              <input 
                type="text"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 transition-colors"
                value={expenseForm.description}
                onChange={e => setExpenseForm({...expenseForm, description: e.target.value})}
                placeholder="Optional description"
              />
            </div>
            <Button type="submit" variant="outline" className="w-full mt-2">
              Record Expense
            </Button>
          </form>
        </div>
      </div>
    </AnimatedPage>
  )
}
