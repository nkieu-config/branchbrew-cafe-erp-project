"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSalesTrendsSuspense } from "@/hooks/domains/useReportsQueries";
import {
  dashboardSkeletonClass,
  dashboardWidgetCardClass,
  dashboardWidgetTitleClass,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

const SalesChart = dynamic(
  () => import("@/components/dashboard/SalesChart").then((m) => m.SalesChart),
  {
    ssr: false,
    loading: () => <div className={dashboardSkeletonClass("h-[350px] w-full")} />,
  },
);

export function SalesChartWidget({ branchId }: { branchId: string }) {
  const { data: salesTrends } = useSalesTrendsSuspense(branchId);

  return (
    <Card className={dashboardWidgetCardClass("chart", "h-[400px] flex flex-col")}>
      <CardHeader className="shrink-0 pb-2">
        <CardTitle className={cn("text-2xl", dashboardWidgetTitleClass("chart"))}>
          Revenue Overview
        </CardTitle>
        <CardDescription className={cn("font-medium text-sm", text.muted)}>
          7-day performance trend
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <SalesChart data={salesTrends ?? []} />
      </CardContent>
    </Card>
  );
}
