"use client"

import { useState, useEffect } from "react"
import { AnimatedPage } from "@/components/animated-page"
import { getBranchInventory, recordWaste, getWasteLogs, getBranch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Trash2, AlertCircle } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function WasteLogPage() {
  const [inventory, setInventory] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { activeBranchId } = useAuth()

  const [form, setForm] = useState({
    ingredientId: "",
    quantity: "",
    reason: ""
  })

  useEffect(() => {
    if (activeBranchId) {
      fetchData()
    } else {
      setInventory([])
      setLogs([])
      setIsLoading(false)
    }
  }, [activeBranchId])

  const fetchData = async () => {
    if (!activeBranchId) return;
    setIsLoading(true)
    try {
      const [branchData, logData] = await Promise.all([
        getBranch(activeBranchId),
        getWasteLogs(activeBranchId)
      ])
      setInventory(branchData.inventories || [])
      setLogs(logData || [])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.ingredientId || !form.quantity || !form.reason) return
    try {
      await recordWaste({
        ingredientId: parseInt(form.ingredientId),
        quantity: parseFloat(form.quantity),
        reason: form.reason
      })
      setForm({ ingredientId: "", quantity: "", reason: "" })
      fetchData()
    } catch (error) {
      alert("Failed to record waste")
    }
  }

  return (
    <AnimatedPage className="max-w-[1600px] w-full mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-balance">Waste Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Record and track inventory wastage.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Record Form */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6">
          <div className="flex items-center gap-3 text-red-500">
            <Trash2 className="w-5 h-5" />
            <h2 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Record Waste</h2>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Ingredient</label>
              <select 
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                value={form.ingredientId}
                onChange={e => setForm({...form, ingredientId: e.target.value})}
                required
              >
                <option value="">Select Ingredient...</option>
                {inventory.map(inv => (
                  <option key={inv.ingredientId} value={inv.ingredientId}>
                    {inv.ingredient.name} (Stock: {inv.stock} {inv.ingredient.unit})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Quantity Wasted</label>
              <input 
                type="number"
                step="0.01"
                min="0.01"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                value={form.quantity}
                onChange={e => setForm({...form, quantity: e.target.value})}
                required
                placeholder="e.g. 10.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Reason</label>
              <input 
                type="text"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                value={form.reason}
                onChange={e => setForm({...form, reason: e.target.value})}
                required
                placeholder="e.g. Expired, Spilled"
              />
            </div>
            <Button type="submit" className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white border-0 shadow-lg shadow-red-500/20">
              Submit Waste Log
            </Button>
          </form>
        </div>

        {/* Logs Table */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col">
          <h2 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-4">Recent Waste Logs</h2>
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
              <AlertCircle className="w-12 h-12 mb-3 opacity-20" />
              <p>No waste recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Date</th>
                    <th className="px-4 py-3">Ingredient</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3 rounded-r-lg">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-400 tabular-nums">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-900 dark:text-slate-100">
                        {log.ingredient.name}
                      </td>
                      <td className="px-4 py-4 text-red-500 font-medium tabular-nums">
                        -{log.quantity} {log.ingredient.unit}
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                        {log.reason}
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                        {log.recordedBy.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  )
}
