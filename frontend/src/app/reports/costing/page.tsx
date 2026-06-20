"use client"

import { useState, useEffect } from "react"
import { AnimatedPage } from "@/components/animated-page"
import { getOrders } from "@/lib/api"
import { TrendingUp, DollarSign, Activity } from "lucide-react"

export default function CostingReportPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const data = await getOrders()
      setOrders(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalRevenue = orders.reduce((sum, o) => sum + (o.netAmount || 0), 0)
  const totalCogs = orders.reduce((sum, o) => sum + (o.totalCogs || 0), 0)
  const grossProfit = totalRevenue - totalCogs
  const margin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Revenue</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                ฿{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total COGS (Cost of Goods)</p>
              <h3 className="text-3xl font-bold text-red-500 mt-1 tabular-nums">
                ฿{totalCogs.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Gross Profit (Margin: {margin.toFixed(1)}%)</p>
              <h3 className="text-3xl font-bold text-blue-500 mt-1 tabular-nums">
                ฿{grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <h2 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-4">Transaction History</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">Loading data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Order ID</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Revenue</th>
                  <th className="px-4 py-3 text-right">COGS</th>
                  <th className="px-4 py-3 text-right rounded-r-lg">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((order) => {
                  const profit = order.netAmount - order.totalCogs;
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-4 font-medium text-slate-900 dark:text-slate-100">#{order.id}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{new Date(order.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-4 text-right tabular-nums">฿{order.netAmount.toFixed(2)}</td>
                      <td className="px-4 py-4 text-right text-red-500 tabular-nums">฿{order.totalCogs.toFixed(2)}</td>
                      <td className="px-4 py-4 text-right text-blue-500 font-medium tabular-nums">฿{profit.toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
