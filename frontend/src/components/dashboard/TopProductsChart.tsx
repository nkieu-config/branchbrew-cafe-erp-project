"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { Award } from "lucide-react";
import { getChartPalette } from "@/lib/theme/chart-styles";
import { decorativeIconClassName } from "@/lib/theme/color-helpers";
import { dashboardChartEmptyClass } from "@/lib/theme/dashboard";
import { text } from "@/lib/theme/surface";
import { typeUiLabelClassName } from "@/lib/theme/typography";
import { useChartTheme } from "@/hooks/useChartTheme";
import { cn } from "@/lib/utils";

type TopProduct = { name: string; totalQuantity: number };

export function TopProductsChart({ data }: { data: TopProduct[] }) {
  const chartTheme = useChartTheme();
  const [colors, setColors] = useState<string[]>(() => getChartPalette());

  useEffect(() => {
    setColors(getChartPalette());
  }, [chartTheme]);

  if (data.length === 0) {
    return (
      <div className={dashboardChartEmptyClass("h-full min-h-[220px]")}>
        <Award className={decorativeIconClassName("w-10 h-10")} aria-hidden />
        <p className={cn(typeUiLabelClassName("text-sm"), text.primary)}>No sales recorded today</p>
        <p className={cn("text-sm", text.muted)}>Best sellers will appear once items are sold.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 60, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={chartTheme.grid} />
        <XAxis type="number" hide />
        <YAxis
          dataKey="name"
          type="category"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: chartTheme.axis, fontWeight: 600 }}
          width={110}
        />
        <Tooltip
          cursor={{ fill: chartTheme.cursor, opacity: 0.5 }}
          contentStyle={{
            borderRadius: "12px",
            border: `1px solid ${chartTheme.tooltipBorder}`,
            boxShadow: chartTheme.tooltipShadow,
            backgroundColor: chartTheme.tooltipBg,
            color: chartTheme.tooltipFg,
          }}
          formatter={(value) => [`${Number(value ?? 0)} units`, "Sold"]}
          labelStyle={{ fontWeight: "bold", color: chartTheme.tooltipFg, marginBottom: "4px" }}
        />
        <Bar dataKey="totalQuantity" radius={[0, 8, 8, 0]} barSize={26}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
