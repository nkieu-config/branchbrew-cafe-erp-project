"use client";

import { useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { SalesTrendPoint } from "@/types/api";
import { format, parseISO } from "date-fns";
import { dashboardSkeletonClass } from "@/lib/theme";
import { useChartTheme } from "@/hooks/useChartTheme";

interface SalesChartProps {
  data?: SalesTrendPoint[];
  loading?: boolean;
}

export function SalesChart({ data = [], loading }: SalesChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  const chartTheme = useChartTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = data.map((row) => ({
    date: format(parseISO(row.date), "EEE"),
    revenue: Number(row.total),
    orders: row.orders,
  }));

  if (!isMounted || loading) {
    return <div className={dashboardSkeletonClass("h-[350px] w-full")} />;
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
              <stop offset="5%" stopColor={chartTheme.revenue} stopOpacity={0.3} />
              <stop offset="95%" stopColor={chartTheme.revenue} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: chartTheme.axis, fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: chartTheme.axis, fontSize: 12 }}
            tickFormatter={(value) => `฿${value / 1000}k`}
            dx={-10}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: chartTheme.tooltipBg,
              borderColor: chartTheme.tooltipBorder,
              borderRadius: "8px",
              boxShadow: chartTheme.tooltipShadow,
              color: chartTheme.tooltipFg,
            }}
            itemStyle={{ color: chartTheme.revenue, fontWeight: "bold" }}
            formatter={(value, name) => {
              const num = Number(value ?? 0);
              if (name === "revenue") return [`฿${num.toLocaleString()}`, "Revenue"];
              return [num, "Orders"];
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={chartTheme.revenue}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
