"use client";

import { useState, useEffect, useId, useMemo } from "react";
import {
  Area,
  Line,
  ComposedChart,
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
  days?: number;
}

function formatRevenueAxisCompact(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `฿${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1000) return `฿${Math.round(value / 1000)}k`;
  return `฿${Math.round(value)}`;
}

function formatRevenueAxis(value: number) {
  if (value >= 1_000_000) return `฿${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `฿${Math.round(value / 1000)}k`;
  return formatCurrency(Math.round(value));
}

const CHART_HEIGHT_MOBILE = 240;
const CHART_HEIGHT_DESKTOP = 300;

export function SalesChart({ data = [], loading, days = 7 }: SalesChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsSmDown();
  const chartTheme = useChartTheme();
  const gradientId = useId().replace(/:/g, "");
  const chartHeight = isMobile ? CHART_HEIGHT_MOBILE : CHART_HEIGHT_DESKTOP;
  const isMonthly = days >= 30;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = useMemo(
    () =>
      data.map((row) => ({
        date: format(parseISO(row.date), isMonthly ? "d" : isMobile ? "EEEEE" : "EEE"),
        fullDate: format(parseISO(row.date), "EEE, MMM d"),
        revenue: Number(row.total),
        orders: row.orders,
      })),
    [data, isMobile, isMonthly],
  );

  const xInterval = isMonthly
    ? isMobile
      ? 5
      : 2
    : isMobile
      ? 0
      : "preserveStartEnd";
  const showDots = !isMonthly && !isMobile;

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
    <div className="w-full min-w-0">
      <div className={cn("mb-1 flex items-center justify-end gap-4 text-xs", text.muted)}>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-3 rounded-sm"
            style={{ backgroundColor: chartTheme.revenue }}
            aria-hidden
          />
          Revenue
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-0 w-3 border-t-2 border-dashed"
            style={{ borderColor: chartTheme.orders }}
            aria-hidden
          />
          Orders
        </span>
      </div>
      <div style={{ height: chartHeight, minHeight: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={chartHeight}>
        <ComposedChart
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
            interval={xInterval}
          />
          <YAxis
            yAxisId="revenue"
            axisLine={false}
            tickLine={false}
            width={isMobile ? 44 : 52}
            tick={{ fill: chartTheme.axis, fontSize: isMobile ? 10 : 12 }}
            tickFormatter={isMobile ? formatRevenueAxisCompact : formatRevenueAxis}
            dx={isMobile ? -2 : -6}
          />
          <YAxis
            yAxisId="orders"
            orientation="right"
            axisLine={false}
            tickLine={false}
            width={isMobile ? 24 : 32}
            allowDecimals={false}
            tick={{ fill: chartTheme.axis, fontSize: isMobile ? 10 : 12 }}
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
            yAxisId="revenue"
            type="monotone"
            dataKey="revenue"
            stroke={chartTheme.revenue}
            strokeWidth={isMobile ? 2 : 2.5}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
            dot={showDots ? { r: 3, fill: chartTheme.revenue, strokeWidth: 0 } : false}
            activeDot={isMobile ? { r: 4 } : { r: 5, strokeWidth: 2, stroke: chartTheme.tooltipBg }}
          />
          <Line
            yAxisId="orders"
            type="monotone"
            dataKey="orders"
            stroke={chartTheme.orders}
            strokeWidth={isMobile ? 1.5 : 2}
            strokeDasharray="4 3"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
