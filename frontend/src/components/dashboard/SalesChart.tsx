"use client"

import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import type { SalesTrendPoint } from "@/types/api"
import { format, parseISO } from "date-fns"

interface SalesChartProps {
  data?: SalesTrendPoint[]
  loading?: boolean
}

export function SalesChart({ data = [], loading }: SalesChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const chartData = data.map((row) => ({
    date: format(parseISO(row.date), "EEE"),
    revenue: Number(row.total),
    orders: row.orders,
  }))

  if (!isMounted || loading) {
    return <div className="h-[350px] w-full animate-pulse bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
  }

  return (
    <div className="h-[350px] w-full min-h-[350px] min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={350}>
        <AreaChart
          data={chartData}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#e2e8f0"} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 12 }}
            tickFormatter={(value) => `฿${value / 1000}k`}
            dx={-10}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#0f172a" : "#ffffff",
              borderColor: isDark ? "#1e293b" : "#e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              color: isDark ? "#f8fafc" : "#0f172a",
            }}
            itemStyle={{ color: "#10b981", fontWeight: "bold" }}
            formatter={(value, name) => {
              const num = Number(value ?? 0);
              if (name === 'revenue') return [`฿${num.toLocaleString()}`, 'Revenue'];
              return [num, 'Orders'];
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#10b981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
