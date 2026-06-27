"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Store, AlertTriangle, CheckCircle2, Award } from "lucide-react";
import { useAnalyticsSummarySuspense, useTopProductsSuspense } from "@/hooks/domains/useReportsQueries";
import { formatDashboardCurrency } from "./format-currency";
import { formatDate } from "@/lib/intl-date";
import {
  dashboardAlertsEmptyClass,
  dashboardAlertsHeaderClass,
  dashboardAlertsRowClass,
  dashboardSkeletonClass,
  dashboardTrendBadgeClass,
  dashboardWidgetCardClass,
  dashboardWidgetIconSoftClass,
  dashboardWidgetIconSolidClass,
  dashboardWidgetLabelClass,
  dashboardWidgetTitleClass,
  dashboardWidgetValueClass,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

const TopProductsChart = dynamic(
  () => import("@/components/dashboard/TopProductsChart").then((m) => m.TopProductsChart),
  {
    ssr: false,
    loading: () => <div className={dashboardSkeletonClass("h-full w-full")} />,
  },
);

export function SalesWidget({ branchId }: { branchId: string }) {
  const { data: summary } = useAnalyticsSummarySuspense(branchId);

  return (
    <Card className={dashboardWidgetCardClass("sales")}>
      <CardContent className="p-8 h-full flex flex-col justify-center">
        <div className="flex justify-between items-start">
          <div>
            <p className={dashboardWidgetLabelClass("sales")}>Today&apos;s Sales</p>
            <h3 className={cn("text-4xl mt-2", dashboardWidgetValueClass("sales"))}>
              {formatDashboardCurrency(summary?.salesToday || 0)}
            </h3>
            <div className="flex items-center gap-2 mt-4">
              <span
                className={cn(
                  "flex items-center text-sm font-bold px-2 py-1 rounded",
                  dashboardTrendBadgeClass(summary?.salesGrowth >= 0),
                )}
              >
                {summary?.salesGrowth >= 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {Math.abs(summary?.salesGrowth || 0).toFixed(1)}%
              </span>
              <span className={cn("text-sm font-medium", text.muted)}>vs yesterday</span>
            </div>
          </div>
          <div className={dashboardWidgetIconSolidClass()}>
            <DollarSign className="w-8 h-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TopBranchWidget({ branchId }: { branchId: string }) {
  const { data: summary } = useAnalyticsSummarySuspense(branchId);

  return (
    <Card className={dashboardWidgetCardClass("branch")}>
      <CardContent className="p-8 h-full flex flex-col justify-center">
        <div className="flex justify-between items-start">
          <div>
            <p className={dashboardWidgetLabelClass("branch")}>Top Branch Today</p>
            <h3 className={cn("text-3xl mt-2", text.primary)}>{summary?.topBranch?.name || "N/A"}</h3>
            <div className={cn("text-xl font-bold mt-2", dashboardWidgetValueClass("branch"))}>
              {formatDashboardCurrency(summary?.topBranch?.totalSales || 0)}
            </div>
          </div>
          <div className={dashboardWidgetIconSoftClass("branch")}>
            <Store className="w-8 h-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LowStockWidget({ branchId }: { branchId: string }) {
  const { data: summary } = useAnalyticsSummarySuspense(branchId);

  return (
    <Card className={dashboardWidgetCardClass("alerts", "h-[300px] overflow-hidden flex flex-col")}>
      <CardHeader className={dashboardAlertsHeaderClass()}>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> Inventory Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto">
        {summary?.lowStockAlerts?.length > 0 || summary?.expiryAlerts?.length > 0 ? (
          <div className="divide-y divide-[var(--widget-alerts-divider)]">
            {summary?.lowStockAlerts?.map((alert: { id: string; ingredientName: string; stock: number; minStock: number; branchName: string }) => (
              <div key={`low-${alert.id}`} className={dashboardAlertsRowClass("low")}>
                <div>
                  <div className={cn("font-bold text-lg", text.primary)}>{alert.ingredientName}</div>
                  <div className={cn("text-sm font-medium", text.muted)}>{alert.branchName} · Low stock</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-xl text-[var(--widget-alerts-low-value)]">{alert.stock}</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--widget-alerts-low-meta)]">
                    Min: {alert.minStock}
                  </div>
                </div>
              </div>
            ))}
            {summary?.expiryAlerts?.map((alert: { id: number; ingredientName: string; branchName: string; quantity: number; expiryDate: string; status: string }) => (
              <div key={`exp-${alert.id}`} className={dashboardAlertsRowClass("expiry")}>
                <div>
                  <div className={cn("font-bold text-lg", text.primary)}>{alert.ingredientName}</div>
                  <div className={cn("text-sm font-medium", text.muted)}>
                    {alert.branchName} · {alert.status === "EXPIRED" ? "Expired batch" : "Expiring soon"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-xl text-[var(--widget-alerts-expiry-value)]">{alert.quantity}</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--widget-alerts-expiry-meta)]">
                    {formatDate(alert.expiryDate)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={dashboardAlertsEmptyClass()}>
            <CheckCircle2 className="w-12 h-12 mb-3 text-[var(--widget-alerts-empty-icon)]" />
            <span className="font-bold text-lg text-[var(--widget-alerts-empty-text)]">
              Stock and expiry levels look healthy.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TopProductsWidget({ branchId }: { branchId: string }) {
  const { data: topProducts } = useTopProductsSuspense(branchId);

  return (
    <Card className={dashboardWidgetCardClass("products", "h-[400px] flex flex-col")}>
      <CardHeader className="shrink-0 pb-2">
        <CardTitle className={cn("flex items-center gap-2 text-2xl", dashboardWidgetTitleClass("products"))}>
          <Award className="w-6 h-6" /> Top 5 Best Sellers
        </CardTitle>
        <CardDescription className={cn("font-medium text-sm", text.muted)}>
          Highest volume items today
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pt-4">
        <TopProductsChart data={topProducts ?? []} />
      </CardContent>
    </Card>
  );
}
