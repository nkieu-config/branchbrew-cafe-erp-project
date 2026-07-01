"use client";

import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart } from "lucide-react";
import { DashboardWidgetHeader } from "@/components/dashboard/DashboardWidgetHeader";
import { useSalesTrendsSuspense } from "@/hooks/domains/useReportsQueries";
import { dashboardSkeletonClass, dashboardWidgetCardClass } from "@/lib/theme/dashboard";

const SalesChart = dynamic(
  () => import("@/components/dashboard/SalesChart").then((m) => m.SalesChart),
  {
    ssr: false,
    loading: () => <div className={dashboardSkeletonClass("h-[260px] w-full")} />,
  },
);

export function SalesChartWidget({ branchId }: { branchId: string }) {
  const { data: salesTrends } = useSalesTrendsSuspense(branchId);

  return (
    <Card className={dashboardWidgetCardClass("chart", "h-[320px] flex flex-col")}>
      <DashboardWidgetHeader
        variant="chart"
        icon={LineChart}
        title="Revenue Overview"
        description="7-day performance trend"
      />
      <CardContent className="flex-1 min-h-0 px-5 pb-4 pt-1">
        <SalesChart data={salesTrends ?? []} />
      </CardContent>
    </Card>
  );
}
