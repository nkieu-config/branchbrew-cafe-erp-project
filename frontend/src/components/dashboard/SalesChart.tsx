"use client"

import { useTheme } from "next-themes"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

const data = [
  { date: "Mon", revenue: 12000, orders: 45 },
  { date: "Tue", revenue: 15500, orders: 52 },
  { date: "Wed", revenue: 11000, orders: 38 },
  { date: "Thu", revenue: 18000, orders: 65 },
  { date: "Fri", revenue: 22000, orders: 82 },
  { date: "Sat", revenue: 28500, orders: 110 },
  { date: "Sun", revenue: 24000, orders: 95 },
]

export function SalesChart() {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isDark ? "#10b981" : "#10b981"} stopOpacity={0.3} />
              <stop offset="95%" stopColor={isDark ? "#10b981" : "#10b981"} stopOpacity={0} />
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
              color: isDark ? "#f8fafc" : "#0f172a"
            }}
            itemStyle={{ color: "#10b981", fontWeight: "bold" }}
            formatter={(value: number) => [`฿${value.toLocaleString()}`, "Revenue"]}
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
