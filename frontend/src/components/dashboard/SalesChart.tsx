"use client";

import { useState, useEffect, useId, useMemo } from "react";
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
import { BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/money";
import { decorativeIconClassName } from "@/lib/theme/color-helpers";
import { dashboardChartEmptyClass, dashboardSkeletonClass } from "@/lib/theme/dashboard";
import { text } from "@/lib/theme/surface";
import { typeUiLabelClassName } from "@/lib/theme/typography";
import { useChartTheme } from "@/hooks/useChartTheme";
import { useIsSmDown } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

interface SalesChartProps {
  data?: SalesTrendPoint[];
  loading?: boolean;
}

function formatRevenueAxisCompact(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1000) return `${Math.round(value / 1000)}k`;
  return String(Math.round(value));
}

function formatRevenueAxis(value: number) {
  if (value >= 1_000_000) return `฿${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `฿${Math.round(value / 1000)}k`;
  return formatCurrency(Math.round(value));
}

const CHART_HEIGHT_MOBILE = 240;
const CHART_HEIGHT_DESKTOP = 300;

export function SalesChart({ data = [], loading }: SalesChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsSmDown();
  const chartTheme = useChartTheme();
  const gradientId = useId().replace(/:/g, "");
  const chartHeight = isMobile ? CHART_HEIGHT_MOBILE : CHART_HEIGHT_DESKTOP;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = useMemo(
    () =>
      data.map((row) => ({
        date: format(parseISO(row.date), isMobile ? "EEEEE" : "EEE"),
        fullDate: format(parseISO(row.date), "EEE, MMM d"),
        revenue: Number(row.total),
        orders: row.orders,
      })),
    [data, isMobile],
  );

  if (!isMounted || loading) {
    return (
      <div className={dashboardSkeletonClass("h-[240px] w-full sm:h-[300px]")} />
    );
  }

  if (chartData.length === 0) {
    return (
      <div className={dashboardChartEmptyClass("h-[240px] sm:h-[300px]")}>
        <BarChart3 className={decorativeIconClassName("w-10 h-10")} aria-hidden />
        <p className={typeUiLabelClassName(cn("text-sm", text.primary))}>No revenue data yet</p>
        <p className={cn("text-sm", text.muted)}>Sales trends will appear once orders are recorded.</p>
      </div>
    );
  }

  return (
    <div
      className="w-full min-w-0"
      style={{ height: chartHeight, minHeight: chartHeight }}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={chartHeight}>
        <AreaChart
          data={chartData}
          margin={{
            top: isMobile ? 8 : 12,
            right: isMobile ? 4 : 16,
            left: isMobile ? -4 : 4,
            bottom: isMobile ? 0 : 4,
          }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartTheme.revenue} stopOpacity={0.3} />
              <stop offset="95%" stopColor={chartTheme.revenue} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: chartTheme.axis, fontSize: isMobile ? 10 : 12 }}
            dy={8}
            interval={isMobile ? 0 : "preserveStartEnd"}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={isMobile ? 36 : 52}
            tick={{ fill: chartTheme.axis, fontSize: isMobile ? 10 : 12 }}
            tickFormatter={isMobile ? formatRevenueAxisCompact : formatRevenueAxis}
            dx={isMobile ? -2 : -6}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: chartTheme.tooltipBg,
              borderColor: chartTheme.tooltipBorder,
              borderRadius: "8px",
              boxShadow: chartTheme.tooltipShadow,
              color: chartTheme.tooltipFg,
            }}
            labelFormatter={(_, payload) => {
              const row = payload?.[0]?.payload as { fullDate?: string } | undefined;
              return row?.fullDate ?? "";
            }}
            itemStyle={{ color: chartTheme.revenue, fontWeight: "bold" }}
            formatter={(value, name) => {
              const num = Number(value ?? 0);
              if (name === "revenue") return [formatCurrency(num), "Revenue"];
              return [num, "Orders"];
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={chartTheme.revenue}
            strokeWidth={isMobile ? 2 : 2.5}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
            dot={isMobile ? false : { r: 3, fill: chartTheme.revenue, strokeWidth: 0 }}
            activeDot={isMobile ? { r: 4 } : { r: 5, strokeWidth: 2, stroke: chartTheme.tooltipBg }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
