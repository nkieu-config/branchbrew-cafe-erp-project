"use client"

import { useState, useEffect } from "react"
import { AnimatedPage } from "@/components/animated-page"
import { getBranches, generatePayrollRun, getPayrollRuns, approvePayrollRun } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Banknote, Play, CheckCircle2, FileText } from "lucide-react"

export default function PayrollPage() {
  const [branches, setBranches] = useState<any[]>([])
  const [selectedBranch, setSelectedBranch] = useState<number>(0)
  const [runs, setRuns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (branches.length > 0) {
      fetchRuns()
    }
  }, [selectedBranch])

  const fetchInitialData = async () => {
    setIsLoading(true)
    try {
      const bData = await getBranches()
      setBranches(bData || [])
      if (bData && bData.length > 0) {
        setSelectedBranch(bData[0].id)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRuns = async () => {
    setIsLoading(true)
    try {
      const data = await getPayrollRuns(selectedBranch)
      setRuns(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerate = async () => {
    try {
      await generatePayrollRun(selectedBranch, currentMonth, currentYear)
      alert("Payroll run generated successfully!")
      fetchRuns()
    } catch (error: any) {
      alert(error.message || "Failed to generate payroll")
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await approvePayrollRun(id)
      alert("Payroll Approved!")
      fetchRuns()
    } catch (error) {
      alert("Failed to approve")
    }
  }

  return (
    <AnimatedPage className="max-w-[1400px] w-full mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Banknote className="w-6 h-6 text-emerald-500" />
            Payroll Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Generate and approve monthly salary runs for employees.</p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 outline-none"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(Number(e.target.value))}
          >
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <Button onClick={handleGenerate} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-sm border-0 gap-2">
            <Play className="w-4 h-4" />
            Generate {currentMonth}/{currentYear}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {runs.map((run) => (
          <div key={run.id} className="glass-panel p-6 rounded-2xl flex flex-col gap-4 border-l-4 border-emerald-500">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Payroll Run: {run.month}/{run.year}</h3>
                <p className="text-sm text-slate-500">Created: {new Date(run.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${run.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                  {run.status}
                </span>
                {run.status === 'DRAFT' && (
                  <Button variant="outline" className="gap-2 text-emerald-600 hover:text-emerald-700 border-emerald-200" onClick={() => handleApprove(run.id)}>
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </Button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Employee</th>
                    <th className="px-4 py-3 text-right">Standard Hrs</th>
                    <th className="px-4 py-3 text-right">OT Hrs</th>
                    <th className="px-4 py-3 text-right">Base Pay</th>
                    <th className="px-4 py-3 text-right">OT Pay</th>
                    <th className="px-4 py-3 text-right text-red-500">SS Deduction</th>
                    <th className="px-4 py-3 text-right text-red-500">Tax (3%)</th>
                    <th className="px-4 py-3 text-right font-bold rounded-r-lg text-emerald-600">Net Pay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {run.payslips.map((slip: any) => (
                    <tr key={slip.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{slip.user?.name}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{slip.standardHours.toFixed(2)}h</td>
                      <td className="px-4 py-3 text-right text-amber-500 tabular-nums">{slip.otHours.toFixed(2)}h</td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-600">฿{slip.basePay.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-600">฿{slip.otPay.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-red-500">-฿{slip.socialSecurity.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-red-500">-฿{slip.taxDeduction.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-bold text-emerald-600 dark:text-emerald-400">฿{slip.netPay.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {runs.length === 0 && !isLoading && (
          <div className="text-center py-12 text-slate-500 flex flex-col items-center">
            <FileText className="w-12 h-12 mb-3 opacity-20" />
            <p>No payroll runs found for this branch.</p>
          </div>
        )}
      </div>
    </AnimatedPage>
  )
}
