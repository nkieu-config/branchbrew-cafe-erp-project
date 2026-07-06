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
import { formatCurrency } from "@/lib/money";
import { surfaceInsetSkeletonClassName } from "@/lib/theme/color-helpers";
import { readCssVar } from "@/lib/theme/css-var";
import { dashboardChartEmptyClass } from "@/lib/theme/dashboard";
import { themeDefaults } from "@/lib/theme/defaults";
import { text } from "@/lib/theme/surface";
import { useChartTheme } from "@/hooks/useChartTheme";
import type { LedgerChartPoint } from "@/lib/filters/ledger-filters";
import { cn } from "@/lib/utils";

type LedgerTrendChartProps = {
  data: LedgerChartPoint[];
  loading?: boolean;
};

export function LedgerTrendChart({ data, loading = false }: LedgerTrendChartProps) {
  const chartTheme = useChartTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [expenseColor, setExpenseColor] = useState(() =>
    readCssVar("--metric-red", themeDefaults.light.destructive),
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setExpenseColor(readCssVar("--metric-red", themeDefaults.light.destructive));
  }, [chartTheme]);

  if (!isMounted || loading) {
    return <div className={surfaceInsetSkeletonClassName("h-[280px] w-full rounded-xl")} />;
  }

  if (data.length === 0) {
    return (
      <div className={dashboardChartEmptyClass("h-[280px]")}>
        <p className={cn("text-sm", text.muted)}>No trend data yet</p>
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full min-h-[280px] min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
        <LineChart data={data} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
          <XAxis
            dataKey="month"
            tick={{ fill: chartTheme.axis, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: chartTheme.axis, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => formatCurrency(Number(val))}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: chartTheme.tooltipBg,
              borderColor: chartTheme.tooltipBorder,
              borderRadius: "8px",
              boxShadow: chartTheme.tooltipShadow,
              color: chartTheme.tooltipFg,
              fontSize: "13px",
            }}
            formatter={(value, name) => [
              formatCurrency(Number(value ?? 0)),
              String(name ?? ""),
            ]}
          />
          <Legend
            wrapperStyle={{
              fontSize: "13px",
              paddingTop: "12px",
              color: chartTheme.tooltipFg,
            }}
          />
          <Line
            type="monotone"
            name="Revenue"
            dataKey="revenue"
            stroke={chartTheme.revenue}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            name="Expenses"
            dataKey="expense"
            stroke={expenseColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
