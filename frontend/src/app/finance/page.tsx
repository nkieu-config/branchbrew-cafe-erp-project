"use client"

import { useState } from "react"
import { AnimatedPage } from "@/components/animated-page"
import { PageHeader } from "@/components/shared/page-header"
import { exportSales } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { CheckCircle2, DollarSign, ArrowUpRight, Download } from "lucide-react"

import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { useFinanceSettlements, useFinanceExpenses, useApproveSettlement } from "@/hooks/useQueries"

import { Settlement, Expense } from "@/types"

export default function FinanceDashboardPage() {
  const { token, activeBranchId } = useAuth()
  const branchIdNum = activeBranchId ? Number(activeBranchId) : undefined;
  
  const { data: settlements = [], isLoading: loadingSettlements } = useFinanceSettlements(branchIdNum)
  const { data: expenses = [], isLoading: loadingExpenses } = useFinanceExpenses(branchIdNum)
  const approveSettlementMutation = useApproveSettlement()

  const isLoading = loadingSettlements || loadingExpenses

  const handleApprove = async (id: number) => {
    try {
      await approveSettlementMutation.mutateAsync(id)
      toast.success("Approved successfully")
    } catch (error) {
      toast.error("Failed to approve")
    }
  }

  const handleExport = async () => {
    if (!token) return
    try {
      toast.info("Exporting sales...")
      await exportSales(token, activeBranchId || undefined)
      toast.success("Export successful!")
    } catch (error) {
      toast.error("Export failed")
    }
  }

  return (
    <AnimatedPage className="max-w-[1600px] w-full mx-auto space-y-6">
      <PageHeader
        title="Finance & Settlement"
        description="Review end-of-day settlements and petty cash expenses."
        actions={
          <Button onClick={handleExport} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border-none">
            <Download className="w-4 h-4 mr-2" />
            Export Sales (CSV)
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Settlements Table */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <h2 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Shift Settlements
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Date</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3 text-right">Expected</th>
                  <th className="px-4 py-3 text-right">Actual</th>
                  <th className="px-4 py-3 text-right">Diff</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{new Date(s.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{s.branch?.name || 'Main'}</td>
                    <td className="px-4 py-3 text-right tabular-nums">฿{s.expectedCash.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">฿{s.actualCash.toLocaleString()}</td>
                    <td className={`px-4 py-3 text-right tabular-nums font-medium ${s.difference < 0 ? 'text-red-500' : s.difference > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {s.difference > 0 ? '+' : ''}{s.difference.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${s.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {s.status === 'PENDING' && (
                        <Button size="sm" variant="ghost" className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50" onClick={() => handleApprove(s.id)}>
                          Approve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {settlements.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">No settlements found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <h2 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-500" />
            Petty Cash Expenses
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Date</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 rounded-r-lg">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{new Date(e.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{e.category}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{e.description || '-'}</td>
                    <td className="px-4 py-3 text-right text-red-500 font-medium tabular-nums">-฿{e.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{e.recordedBy?.name}</td>
                  </tr>
                ))}
                {expenses.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400">No expenses recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AnimatedPage>
  )
}
