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
import { getChartPalette, getChartTheme } from "@/lib/theme";

type TopProduct = { name: string; totalQuantity: number };

export function TopProductsChart({ data }: { data: TopProduct[] }) {
  const [colors, setColors] = useState<string[]>(() => getChartPalette());
  const [chartTheme, setChartTheme] = useState(getChartTheme);

  useEffect(() => {
    const refresh = () => {
      setColors(getChartPalette());
      setChartTheme(getChartTheme());
    };
    refresh();

    const observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

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
          tick={{ fontSize: 13, fill: chartTheme.axis, fontWeight: 700 }}
          width={120}
        />
        <Tooltip
          cursor={{ fill: chartTheme.cursor, opacity: 0.5 }}
          contentStyle={{
            borderRadius: "12px",
            border: `1px solid ${chartTheme.tooltipBorder}`,
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
            backgroundColor: chartTheme.tooltipBg,
            color: chartTheme.tooltipFg,
          }}
          formatter={(value) => [`${Number(value ?? 0)} units`, "Sold"]}
          labelStyle={{ fontWeight: "bold", color: chartTheme.tooltipFg, marginBottom: "4px" }}
        />
        <Bar dataKey="totalQuantity" radius={[0, 6, 6, 0]} barSize={32}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
