"use client"

import { useState, useEffect } from "react"
import { AnimatedPage } from "@/components/animated-page"
import { getHrUsers, updateHourlyRate, getBranches } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Users, Edit2, Save } from "lucide-react"

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [selectedBranch, setSelectedBranch] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editRate, setEditRate] = useState<string>("")

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (branches.length > 0) {
      fetchEmployees()
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

  const fetchEmployees = async () => {
    setIsLoading(true)
    try {
      const data = await getHrUsers(selectedBranch)
      setEmployees(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveRate = async (userId: number) => {
    try {
      await updateHourlyRate(userId, parseFloat(editRate))
      setEditingId(null)
      fetchEmployees()
    } catch (error) {
      alert("Failed to update rate")
    }
  }

  return (
    <AnimatedPage className="max-w-[1200px] w-full mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Users className="w-6 h-6 text-emerald-500" />
          Employee Directory
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage staff details and hourly pay rates.</p>
      </div>

      <div className="flex gap-4 items-center">
        <select 
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 outline-none"
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(Number(e.target.value))}
        >
          {branches.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      <div className="glass-panel p-6 rounded-2xl flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 text-right">Hourly Rate (฿)</th>
                <th className="px-4 py-3 rounded-r-lg text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {employees.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{e.name}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{e.email}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{e.role}</td>
                  <td className="px-4 py-3 text-right font-medium text-blue-500 tabular-nums">
                    {editingId === e.id ? (
                      <input 
                        type="number"
                        className="w-24 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-right"
                        value={editRate}
                        onChange={(ev) => setEditRate(ev.target.value)}
                        autoFocus
                      />
                    ) : (
                      `฿${e.hourlyRate}`
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editingId === e.id ? (
                      <Button size="sm" variant="ghost" className="text-emerald-500" onClick={() => handleSaveRate(e.id)}>
                        <Save className="w-4 h-4 mr-1" /> Save
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" className="text-slate-500" onClick={() => { setEditingId(e.id); setEditRate(e.hourlyRate.toString()); }}>
                        <Edit2 className="w-4 h-4 mr-1" /> Edit
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AnimatedPage>
  )
}
