import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calculator } from "lucide-react"
import { toast } from "sonner"
import { useSubmitSettlement } from '@/hooks/domains/useFinanceQueries'

export function SettlementForm({ branchIdNum, expected }: { branchIdNum: number | undefined, expected: any }) {
  const [actualCash, setActualCash] = useState<string>("")
  const [actualCreditCard, setActualCreditCard] = useState<string>("")
  const [actualQR, setActualQR] = useState<string>("")

  const submitSettlementMutation = useSubmitSettlement();

  const handleSettlement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!actualCash || !branchIdNum) return
    try {
      await submitSettlementMutation.mutateAsync({
        branchId: branchIdNum,
        actualCash: parseFloat(actualCash),
        actualCreditCard: parseFloat(actualCreditCard || "0"),
        actualQR: parseFloat(actualQR || "0")
      });
      toast.success("Settlement submitted successfully for HQ approval.")
      setActualCash("")
      setActualCreditCard("")
      setActualQR("")
    } catch (error: any) {
      toast.error(error.message || "Failed to submit settlement")
    }
  }

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6">
      <div className="flex items-center gap-3 text-emerald-500">
        <Calculator className="w-5 h-5" />
        <h2 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Submit Shift Settlement</h2>
      </div>
      
      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex justify-between text-sm text-slate-500">
          <span>Total Sales (Cash):</span>
          <span className="font-medium tabular-nums">฿{expected?.sales?.toLocaleString() || 0}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-500">
          <span>Petty Cash Expenses:</span>
          <span className="font-medium tabular-nums text-red-500">-฿{expected?.expenses?.toLocaleString() || 0}</span>
        </div>
        <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-semibold">
          <span className="text-slate-900 dark:text-slate-100">Expected Cash in Drawer:</span>
          <span className="text-blue-500 tabular-nums">฿{expected?.expectedCash?.toLocaleString() || 0}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-500 pt-2">
          <span>Expected Credit Card:</span>
          <span className="font-medium tabular-nums">฿{expected?.expectedCreditCard?.toLocaleString() || 0}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-500">
          <span>Expected QR Promtpay:</span>
          <span className="font-medium tabular-nums">฿{expected?.expectedQR?.toLocaleString() || 0}</span>
        </div>
      </div>

      <form onSubmit={handleSettlement} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Actual Cash Counted *</label>
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Actual Card Sales</label>
            <input 
              type="number"
              step="0.01"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:border-emerald-500 transition-colors"
              value={actualCreditCard}
              onChange={e => setActualCreditCard(e.target.value)}
              placeholder="e.g. 1200"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Actual QR Sales</label>
            <input 
              type="number"
              step="0.01"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:border-emerald-500 transition-colors"
              value={actualQR}
              onChange={e => setActualQR(e.target.value)}
              placeholder="e.g. 3500"
            />
          </div>
        </div>
        <Button type="submit" className="w-full py-6 mt-2 bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-600 text-white border-0 shadow-lg">
          Submit Shift Settlement
        </Button>
      </form>
    </div>
  )
}
