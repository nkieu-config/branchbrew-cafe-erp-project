"use client";

import dynamic from "next/dynamic";
import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart } from "lucide-react";
import { DashboardWidgetHeader } from "@/components/dashboard/DashboardWidgetHeader";
import { useSalesTrendsSuspense } from "@/hooks/domains/useReportsQueries";
import {
  dashboardChartWidgetContentClass,
  dashboardChartWidgetShellClass,
  dashboardSkeletonClass,
  dashboardWidgetCardClass,
} from "@/lib/theme/dashboard";
import { cn } from "@/lib/utils";
import { text } from "@/lib/theme/surface";

const SalesChart = dynamic(
  () => import("@/components/dashboard/SalesChart").then((m) => m.SalesChart),
  {
    ssr: false,
    loading: () => <div className={dashboardSkeletonClass("h-[240px] w-full sm:h-[300px]")} />,
  },
);

const RANGE_OPTIONS = [
  { days: 7, label: "7D" },
  { days: 30, label: "30D" },
] as const;

function RangeToggle({
  days,
  pending,
  onChange,
}: {
  days: number;
  pending: boolean;
  onChange: (days: number) => void;
}) {
  return (
    <div
      className={cn(
        "inline-flex rounded-lg border p-0.5",
        "border-(--dashboard-header-border) bg-(--surface-elevated)",
        pending && "opacity-70",
      )}
      role="group"
      aria-label="Trend range"
    >
      {RANGE_OPTIONS.map((option) => {
        const active = option.days === days;
        return (
          <button
            key={option.days}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.days)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-semibold tabular-nums transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring)/50",
              active
                ? "bg-(--brand-solid) text-(--on-brand-solid-fg)"
                : cn("hover:bg-(--surface-muted)", text.muted),
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function SalesChartWidget({ branchId }: { branchId: string }) {
  const [days, setDays] = useState(7);
  const [pending, startTransition] = useTransition();
  const { data: salesTrends } = useSalesTrendsSuspense(branchId, days);

  const handleChange = (next: number) => {
    if (next === days) return;
    startTransition(() => setDays(next));
  };

  return (
    <Card className={dashboardWidgetCardClass("chart", dashboardChartWidgetShellClass())}>
      <DashboardWidgetHeader
        variant="chart"
        icon={LineChart}
        title="Revenue Overview"
        description={`${days}-day performance trend`}
        badge={<RangeToggle days={days} pending={pending} onChange={handleChange} />}
      />
      <CardContent className={dashboardChartWidgetContentClass()}>
        <SalesChart data={salesTrends ?? []} days={days} />
      </CardContent>
    </Card>
  );
}
