"use client";

import dynamic from "next/dynamic";
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

const SalesChart = dynamic(
  () => import("@/components/dashboard/SalesChart").then((m) => m.SalesChart),
  {
    ssr: false,
    loading: () => <div className={dashboardSkeletonClass("h-[240px] w-full sm:h-[300px]")} />,
  },
);

export function SalesChartWidget({ branchId }: { branchId: string }) {
  const { data: salesTrends } = useSalesTrendsSuspense(branchId);

  return (
    <Card className={dashboardWidgetCardClass("chart", dashboardChartWidgetShellClass())}>
      <DashboardWidgetHeader
        variant="chart"
        icon={LineChart}
        title="Revenue Overview"
        description="7-day performance trend"
      />
      <CardContent className={dashboardChartWidgetContentClass()}>
        <SalesChart data={salesTrends ?? []} />
      </CardContent>
    </Card>
  );
}
