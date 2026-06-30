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
import { LineChart as LineChartIcon } from "lucide-react";
import { formatCurrency } from "@/lib/money";
import { decorativeIconClassName, surfaceInsetSkeletonClassName } from "@/lib/theme/color-helpers";
import { readCssVar } from "@/lib/theme/css-var";
import { dashboardChartEmptyClass } from "@/lib/theme/dashboard";
import { themeDefaults } from "@/lib/theme/defaults";
import { text } from "@/lib/theme/surface";
import { typeUiLabelClassName } from "@/lib/theme/typography";
import { useChartTheme } from "@/hooks/useChartTheme";
import type { LedgerChartPoint } from "@/lib/ledger-filters";
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
    return <div className={surfaceInsetSkeletonClassName("h-[350px] w-full rounded-xl")} />;
  }

  if (data.length === 0) {
    return (
      <div className={dashboardChartEmptyClass("h-[350px]")}>
        <LineChartIcon className={decorativeIconClassName("w-10 h-10")} aria-hidden />
        <p className={typeUiLabelClassName(cn("text-sm", text.primary))}>No P&amp;L trend data yet</p>
        <p className={cn("text-sm", text.muted)}>
          Revenue and expense trends appear once journal activity is posted.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full min-h-[350px] min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={350}>
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
            tickFormatter={(val) => formatCurrency(Number(val))}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: chartTheme.tooltipBg,
              borderColor: chartTheme.tooltipBorder,
              borderRadius: "12px",
              boxShadow: chartTheme.tooltipShadow,
              color: chartTheme.tooltipFg,
              fontWeight: "bold",
            }}
            formatter={(value, name) => [
              formatCurrency(Number(value ?? 0)),
              String(name ?? ""),
            ]}
          />
          <Legend
            wrapperStyle={{
              fontWeight: "bold",
              paddingTop: "20px",
              color: chartTheme.tooltipFg,
            }}
          />
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
            name="Expenses (COGS + petty cash)"
            dataKey="expense"
            stroke={expenseColor}
            strokeWidth={4}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 8, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
