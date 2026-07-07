"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardWidgetHeader } from "@/components/dashboard/DashboardWidgetHeader";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Store,
  ShoppingBag,
  AlertTriangle,
  CheckCircle2,
  Award,
  Percent,
} from "lucide-react";
import {
  useProfitLossSuspense,
  useTopProductsSuspense,
} from "@/hooks/domains/useReportsQueries";
import type { ReportsProfitLoss } from "@/types/api";
import { useDashboardSummary } from "@/components/dashboard/DashboardSummaryContext";
import {
  DASHBOARD_ALERT_PREVIEW_LIMIT,
  type DashboardExpiryAlert,
  type DashboardLowStockAlert,
} from "@/lib/inventory-alerts";
import { formatDashboardCurrency } from "@/lib/format-dashboard-currency";
import { formatDate } from "@/lib/intl-date";
import { dashboardAlertsEmptyClass, dashboardAlertsEmptyIconClassName, dashboardAlertsEmptyTextClassName, dashboardAlertsExpiryMetaClassName, dashboardAlertsExpiryValueClassName, dashboardAlertsFooterClass, dashboardAlertsFooterLinkClass, dashboardAlertCountBadgeClass, dashboardAlertsLowMetaClassName, dashboardAlertsLowValueClassName, dashboardAlertsRowClass, dashboardChartWidgetContentClass, dashboardChartWidgetShellClass, dashboardKpiBodyClass, dashboardSkeletonClass, dashboardTrendBadgeClass, dashboardWidgetCardClass, dashboardWidgetIconSoftClass, dashboardWidgetIconSolidClass, dashboardWidgetLabelClass, dashboardWidgetValueClass } from "@/lib/theme/dashboard";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName, typeMetricClassName, typeUiLabelClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";

const TopProductsChart = dynamic(
  () => import("@/components/dashboard/TopProductsChart").then((m) => m.TopProductsChart),
  {
    ssr: false,
    loading: () => <div className={dashboardSkeletonClass("h-full w-full")} />,
  },
);

function hasComparableGrowth(
  growth: number | null | undefined,
  priorValue: number | null | undefined,
): growth is number {
  return (
    typeof growth === "number" &&
    Number.isFinite(growth) &&
    typeof priorValue === "number" &&
    priorValue > 0
  );
}

function computeGrowth(
  today: number | null | undefined,
  yesterday: number | null | undefined,
): number | null {
  if (typeof today !== "number" || typeof yesterday !== "number" || yesterday <= 0) {
    return null;
  }
  return ((today - yesterday) / yesterday) * 100;
}

function AvgTicketTrend({ growth }: { growth: number | null }) {
  if (growth == null) return null;
  const up = growth >= 0;
  return (
    <span
      className={cn(
        "ml-1.5 inline-flex items-center text-xs tabular-nums",
        up ? "text-(--status-success-fg)" : "text-(--status-danger-fg)",
      )}
    >
      {up ? (
        <TrendingUp className="w-3 h-3 mr-0.5" aria-hidden />
      ) : (
        <TrendingDown className="w-3 h-3 mr-0.5" aria-hidden />
      )}
      {Math.abs(growth).toFixed(1)}%
    </span>
  );
}

export function SalesWidget({ branchId }: { branchId: string }) {
  void branchId;
  const summary = useDashboardSummary();
  const showGrowth = hasComparableGrowth(summary?.salesGrowth, summary?.salesYesterday);

  return (
    <Card className={dashboardWidgetCardClass("sales")} data-testid="dashboard-sales">
      <CardContent className={dashboardKpiBodyClass()}>
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <p className={dashboardWidgetLabelClass("sales")}>Today&apos;s Sales</p>
            <p className={cn("text-3xl mt-1 tabular-nums tracking-tight", dashboardWidgetValueClass("sales"))}>
              {formatDashboardCurrency(summary?.salesToday || 0)}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2 min-h-[1.5rem]">
              {showGrowth ? (
                <>
                  <span
                    className={cn(
                      typeUiLabelClassName("inline-flex items-center text-xs px-2.5 py-0.5 tabular-nums"),
                      dashboardTrendBadgeClass(summary.salesGrowth >= 0),
                    )}
                  >
                    {summary.salesGrowth >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5 mr-1" aria-hidden />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 mr-1" aria-hidden />
                    )}
                    {Math.abs(summary.salesGrowth).toFixed(1)}%
                  </span>
                  <span className={cn("text-xs font-medium", text.muted)}>vs yesterday</span>
                </>
              ) : (
                <span className={cn("text-xs font-medium", text.muted)}>No prior-day comparison</span>
              )}
            </div>
          </div>
          <div className={dashboardWidgetIconSolidClass("compact")}>
            <DollarSign className="w-5 h-5" aria-hidden />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MarginWidget({ branchId }: { branchId: string }) {
  const parsed = branchId === "ALL" ? undefined : branchId;
  const { data } = useProfitLossSuspense(parsed);
  const pnl = data as ReportsProfitLoss | undefined;
  const revenue = pnl?.revenue ?? 0;
  const hasRevenue = revenue > 0;
  const grossMarginPct = hasRevenue ? ((pnl?.grossProfit ?? 0) / revenue) * 100 : null;
  const foodCostPct = hasRevenue ? ((pnl?.cogs ?? 0) / revenue) * 100 : null;

  return (
    <Card className={dashboardWidgetCardClass("products")} data-testid="dashboard-margin">
      <CardContent className={dashboardKpiBodyClass()}>
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <p className={dashboardWidgetLabelClass("products")}>Gross Margin</p>
            <p className={cn("text-3xl mt-1 tabular-nums tracking-tight", text.primary)}>
              {grossMarginPct != null ? `${grossMarginPct.toFixed(1)}%` : "—"}
            </p>
            <div className="mt-2 space-y-0.5">
              <p className={cn("text-sm font-medium tabular-nums", text.secondary)}>
                Food cost{" "}
                <span className={cn("font-semibold", text.primary)}>
                  {foodCostPct != null ? `${foodCostPct.toFixed(1)}%` : "—"}
                </span>
              </p>
              <p className={cn("text-xs tabular-nums", text.muted)}>
                Net {formatDashboardCurrency(pnl?.netProfit ?? 0)} · month to date
              </p>
            </div>
          </div>
          <div className={dashboardWidgetIconSolidClass("compact")}>
            <Percent className="w-5 h-5" aria-hidden />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TopBranchWidget({
  branchId,
}: {
  branchId: string;
  branchName?: string;
}) {
  const summary = useDashboardSummary();
  const isAllBranches = branchId === "ALL";

  if (!isAllBranches) {
    const showOrdersGrowth = hasComparableGrowth(
      summary?.ordersGrowth,
      summary?.ordersYesterday,
    );

    return (
      <Card className={dashboardWidgetCardClass("branch")}>
        <CardContent className={dashboardKpiBodyClass()}>
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <p className={dashboardWidgetLabelClass("branch")}>Orders Today</p>
              <p
                className={cn(
                  "text-3xl mt-1 tabular-nums tracking-tight",
                  dashboardWidgetValueClass("branch"),
                )}
              >
                {(summary?.ordersToday ?? 0).toLocaleString()}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2 min-h-[1.5rem]">
                {showOrdersGrowth ? (
                  <>
                    <span
                      className={cn(
                        typeUiLabelClassName("inline-flex items-center text-xs px-2.5 py-0.5 tabular-nums"),
                        dashboardTrendBadgeClass(summary.ordersGrowth >= 0),
                      )}
                    >
                      {summary.ordersGrowth >= 0 ? (
                        <TrendingUp className="w-3.5 h-3.5 mr-1" aria-hidden />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 mr-1" aria-hidden />
                      )}
                      {Math.abs(summary.ordersGrowth).toFixed(1)}%
                    </span>
                    <span className={cn("text-xs font-medium", text.muted)}>vs yesterday</span>
                  </>
                ) : (
                  <span className={cn("text-xs font-medium", text.muted)}>No prior-day comparison</span>
                )}
              </div>
              <p className={cn("text-sm font-semibold mt-2 tabular-nums", text.primary)}>
                Avg ticket{" "}
                <span className={dashboardWidgetValueClass("branch")}>
                  {formatDashboardCurrency(summary?.avgTicketToday ?? 0)}
                </span>
                <AvgTicketTrend
                  growth={computeGrowth(summary?.avgTicketToday, summary?.avgTicketYesterday)}
                />
              </p>
            </div>
            <div className={dashboardWidgetIconSoftClass("branch", "compact")}>
              <ShoppingBag className="w-5 h-5" aria-hidden />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={dashboardWidgetCardClass("branch")}>
      <CardContent className={dashboardKpiBodyClass()}>
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <p className={dashboardWidgetLabelClass("branch")}>Top Branch Today</p>
            <p className={cn("text-xl mt-1 truncate", text.primary)}>
              {summary?.topBranch?.name || "N/A"}
            </p>
            <p
              className={cn(
                typeMetricClassName("text-2xl mt-1 tracking-tight"),
                dashboardWidgetValueClass("branch"),
              )}
            >
              {formatDashboardCurrency(summary?.topBranch?.totalSales || 0)}
            </p>
            <p className={cn("text-sm font-medium mt-2 tabular-nums", text.muted)}>
              {(summary?.ordersToday ?? 0).toLocaleString()} orders network-wide · Avg ticket{" "}
              <span className={cn("font-semibold", dashboardWidgetValueClass("branch"))}>
                {formatDashboardCurrency(summary?.avgTicketToday ?? 0)}
              </span>
            </p>
          </div>
          <div className={dashboardWidgetIconSoftClass("branch", "compact")}>
            <Store className="w-5 h-5" aria-hidden />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertRow({
  href,
  children,
  type,
}: {
  href: string;
  type: "low" | "expiry";
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={dashboardAlertsRowClass(type)}
    >
      {children}
    </Link>
  );
}

function InventoryAlertsFooter({
  lowTotal,
  expiryTotal,
  isAllBranches,
}: {
  lowTotal: number;
  expiryTotal: number;
  isAllBranches: boolean;
}) {
  if (lowTotal === 0 && expiryTotal === 0) return null;

  const lowCapped = isAllBranches && lowTotal >= DASHBOARD_ALERT_PREVIEW_LIMIT;
  const expiryCapped = isAllBranches && expiryTotal >= DASHBOARD_ALERT_PREVIEW_LIMIT;

  return (
    <div className={dashboardAlertsFooterClass()}>
      {lowTotal > 0 && (
        <Link href="/inventory?filter=low" className={dashboardAlertsFooterLinkClass()}>
          {lowCapped ? "View all low stock" : `View all low stock (${lowTotal})`}
        </Link>
      )}
      {expiryTotal > 0 && (
        <Link href="/inventory/batches?filter=expiring" className={dashboardAlertsFooterLinkClass()}>
          {expiryCapped
            ? "View expiring batches"
            : `View expiring batches (${expiryTotal})`}
        </Link>
      )}
    </div>
  );
}

function InventoryAlertsList({
  lowStockAlerts,
  expiryAlerts,
  lowTotal,
  expiryTotal,
  isAllBranches,
}: {
  lowStockAlerts: DashboardLowStockAlert[];
  expiryAlerts: DashboardExpiryAlert[];
  lowTotal: number;
  expiryTotal: number;
  isAllBranches: boolean;
}) {
  const hasAlerts = lowStockAlerts.length > 0 || expiryAlerts.length > 0;

  return (
    <>
      <CardContent className="p-0 flex-1 overflow-y-auto">
        {hasAlerts ? (
          <div className="divide-y divide-[var(--widget-alerts-divider)]">
            {lowStockAlerts.map((alert) => (
              <AlertRow key={`low-${alert.id}`} href="/inventory?filter=low" type="low">
                <div>
                  <div className={typeHeadingClassName("text-base")}>{alert.ingredientName}</div>
                  <div className={cn("text-sm font-medium", text.muted)}>
                    {alert.branchName} · Low stock
                  </div>
                </div>
                <div className="text-right">
                  <div className={dashboardAlertsLowValueClassName("text-lg")}>
                    {alert.stock}
                  </div>
                  <div className={dashboardAlertsLowMetaClassName()}>
                    Min: {alert.minStock}
                  </div>
                </div>
              </AlertRow>
            ))}
            {expiryAlerts.map((alert) => (
              <AlertRow key={`exp-${alert.id}`} href="/inventory/batches?filter=expiring" type="expiry">
                <div>
                  <div className={typeHeadingClassName("text-base")}>{alert.ingredientName}</div>
                  <div className={cn("text-sm font-medium", text.muted)}>
                    {alert.branchName} ·{" "}
                    {alert.status === "EXPIRED" ? "Expired batch" : "Expiring soon"}
                  </div>
                </div>
                <div className="text-right">
                  <div className={dashboardAlertsExpiryValueClassName("text-lg")}>
                    {alert.quantity}
                  </div>
                  <div className={dashboardAlertsExpiryMetaClassName()}>
                    {formatDate(alert.expiryDate)}
                  </div>
                </div>
              </AlertRow>
            ))}
          </div>
        ) : (
          <div className={dashboardAlertsEmptyClass()}>
            <CheckCircle2
              className={dashboardAlertsEmptyIconClassName("w-10 h-10 mb-2")}
              aria-hidden
            />
            <span className={dashboardAlertsEmptyTextClassName()}>
              Stock and expiry levels look healthy.
            </span>
          </div>
        )}
      </CardContent>
      <InventoryAlertsFooter
        lowTotal={lowTotal}
        expiryTotal={expiryTotal}
        isAllBranches={isAllBranches}
      />
    </>
  );
}

export function LowStockWidget({ branchId }: { branchId: string }) {
  const summary = useDashboardSummary();
  const lowStockAlerts = (summary.lowStockAlerts ?? []) as DashboardLowStockAlert[];
  const expiryAlerts = (summary.expiryAlerts ?? []) as DashboardExpiryAlert[];

  return (
    <LowStockWidgetShell
      lowStockAlerts={lowStockAlerts}
      expiryAlerts={expiryAlerts}
      lowTotal={summary.lowStockCount ?? lowStockAlerts.length}
      expiryTotal={summary.expiryCount ?? expiryAlerts.length}
      isAllBranches={branchId === "ALL"}
    />
  );
}

function LowStockWidgetShell({
  lowStockAlerts,
  expiryAlerts,
  lowTotal,
  expiryTotal,
  isAllBranches,
}: {
  lowStockAlerts: DashboardLowStockAlert[];
  expiryAlerts: DashboardExpiryAlert[];
  lowTotal: number;
  expiryTotal: number;
  isAllBranches: boolean;
}) {
  const alertCount = lowTotal + expiryTotal;

  return (
    <Card className={dashboardWidgetCardClass("alerts", "h-[240px] xl:h-full overflow-hidden flex flex-col")}>
      <DashboardWidgetHeader
        variant="alerts"
        icon={AlertTriangle}
        title="Inventory Alerts"
        description={alertCount > 0 ? "Items needing attention today" : "Stock and expiry look healthy"}
        badge={
          alertCount > 0 ? (
            <div className="flex flex-wrap justify-end gap-1">
              {lowTotal > 0 ? (
                <span className={dashboardAlertCountBadgeClass("low")}>{lowTotal} low</span>
              ) : null}
              {expiryTotal > 0 ? (
                <span className={dashboardAlertCountBadgeClass("expiry")}>{expiryTotal} expiry</span>
              ) : null}
            </div>
          ) : (
            <span className={dashboardAlertCountBadgeClass("neutral")}>Clear</span>
          )
        }
      />
      <InventoryAlertsList
        lowStockAlerts={lowStockAlerts}
        expiryAlerts={expiryAlerts}
        lowTotal={lowTotal}
        expiryTotal={expiryTotal}
        isAllBranches={isAllBranches}
      />
    </Card>
  );
}

export function TopProductsWidget({ branchId }: { branchId: string }) {
  const { data: topProducts } = useTopProductsSuspense(branchId);

  return (
    <Card
      className={dashboardWidgetCardClass(
        "products",
        dashboardChartWidgetShellClass("sm:h-auto lg:h-auto sm:min-h-[380px]"),
      )}
    >
      <DashboardWidgetHeader
        variant="products"
        icon={Award}
        title="Top 5 Best Sellers"
        description="Highest volume items today"
      />
      <CardContent className={dashboardChartWidgetContentClass()}>
        <TopProductsChart data={topProducts ?? []} />
      </CardContent>
    </Card>
  );
}
