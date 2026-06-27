"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getChartTheme, readCssVar, themeDefaults } from "@/lib/theme";

type LedgerChartPoint = {
  month: string;
  revenue: number;
  expense: number;
};

export function LedgerTrendChart({ data }: { data: LedgerChartPoint[] }) {
  const [chartTheme, setChartTheme] = useState(getChartTheme);
  const [expenseColor, setExpenseColor] = useState(() =>
    readCssVar("--metric-red", themeDefaults.light.destructive),
  );

  useEffect(() => {
    const refresh = () => {
      setChartTheme(getChartTheme());
      setExpenseColor(readCssVar("--metric-red", themeDefaults.light.destructive));
    };
    refresh();

    const observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
        <XAxis
          dataKey="month"
          tick={{ fill: chartTheme.axis, fontWeight: "bold" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: chartTheme.axis, fontWeight: "bold" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(val) => `฿${val.toLocaleString()}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: chartTheme.tooltipBg,
            borderColor: chartTheme.tooltipBorder,
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
            color: chartTheme.tooltipFg,
            fontWeight: "bold",
          }}
          formatter={(value, name) => [`฿${Number(value ?? 0).toLocaleString()}`, String(name ?? "")]}
        />
        <Legend wrapperStyle={{ fontWeight: "bold", paddingTop: "20px", color: chartTheme.tooltipFg }} />
        <Line
          type="monotone"
          name="Revenue"
          dataKey="revenue"
          stroke={chartTheme.revenue}
          strokeWidth={4}
          dot={{ r: 4, strokeWidth: 2 }}
          activeDot={{ r: 8, strokeWidth: 0 }}
        />
        <Line
          type="monotone"
          name="Expenses (COGS + Petty Cash)"
          dataKey="expense"
          stroke={expenseColor}
          strokeWidth={4}
          dot={{ r: 4, strokeWidth: 2 }}
          activeDot={{ r: 8, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
