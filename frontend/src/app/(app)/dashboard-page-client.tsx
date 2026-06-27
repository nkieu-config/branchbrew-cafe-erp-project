"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { useBranches } from "@/hooks/domains/useGeneralQueries";
import { useAuth } from "@/context/AuthContext";
import { AnimatedPage } from "@/components/animated-page";
import type { Branch } from "@/types/api";
import {
  SalesWidget,
  TopBranchWidget,
  LowStockWidget,
  TopProductsWidget,
} from "@/components/dashboard/widgets/SummaryWidgets";
import { SalesChartWidget } from "@/components/dashboard/widgets/SalesChartWidget";
import { WidgetErrorBoundary } from "@/components/dashboard/widgets/WidgetErrorBoundary";
import {
  StatWidgetSkeleton,
  AlertsWidgetSkeleton,
  ChartWidgetSkeleton,
} from "@/components/dashboard/widgets/WidgetSkeletons";

const DashboardSortableGridLazy = dynamic(
  () => import("@/components/dashboard/DashboardSortableGrid").then((m) => m.DashboardSortableGrid),
  { ssr: false },
);

const DEFAULT_LAYOUT = ["sales", "topBranch", "lowStock", "topProducts", "salesChart"];
const VALID_WIDGET_IDS = new Set(DEFAULT_LAYOUT);
const LAYOUT_PARAM = "layout";
const LAYOUT_STORAGE_KEY = "executive_dashboard_layout";

function normalizeLayout(ids: string[]): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const id of ids) {
    if (VALID_WIDGET_IDS.has(id) && !seen.has(id)) {
      seen.add(id);
      ordered.push(id);
    }
  }
  for (const id of DEFAULT_LAYOUT) {
    if (!seen.has(id)) ordered.push(id);
  }
  return ordered;
}

function parseLayoutParam(value: string | null): string[] | null {
  if (!value) return null;
  const ids = value.split(",").map((part) => part.trim()).filter(Boolean);
  if (ids.length === 0) return null;
  return normalizeLayout(ids);
}

function readStoredLayout(): string[] | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return null;
    return normalizeLayout(parsed.map(String));
  } catch {
    return null;
  }
}

function WidgetBoundary({
  children,
  onReset,
}: {
  children: React.ReactNode;
  onReset: () => void;
}) {
  return <WidgetErrorBoundary onReset={onReset}>{children}</WidgetErrorBoundary>;
}

function AnalyticsDashboardContent() {
  const { activeBranchId } = useAuth();
  const analyticsBranch = activeBranchId != null ? String(activeBranchId) : "ALL";
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [widgetOrder, setWidgetOrder] = useState<string[]>(DEFAULT_LAYOUT);
  const [layoutReady, setLayoutReady] = useState(false);

  useEffect(() => {
    const fromUrl = parseLayoutParam(searchParams.get(LAYOUT_PARAM));
    if (fromUrl) {
      setWidgetOrder(fromUrl);
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(fromUrl));
      setLayoutReady(true);
      return;
    }

    const fromStorage = readStoredLayout() ?? DEFAULT_LAYOUT;
    setWidgetOrder(fromStorage);
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(fromStorage));

    const serialized = fromStorage.join(",");
    if (searchParams.get(LAYOUT_PARAM) !== serialized) {
      const params = new URLSearchParams(searchParams.toString());
      params.set(LAYOUT_PARAM, serialized);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }

    setLayoutReady(true);
  }, [pathname, router, searchParams]);

  const { data: branches = [] } = useBranches();

  const branchLabel =
    activeBranchId != null
      ? (branches as Branch[]).find((b) => b.id === activeBranchId)?.name ?? `Branch #${activeBranchId}`
      : "All Branches (HQ)";

  const handleReorder = useCallback(
    (newOrder: string[]) => {
      const normalized = normalizeLayout(newOrder);
      setWidgetOrder(normalized);
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(normalized));

      const serialized = normalized.join(",");
      if (searchParams.get(LAYOUT_PARAM) !== serialized) {
        const params = new URLSearchParams(searchParams.toString());
        params.set(LAYOUT_PARAM, serialized);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    },
    [pathname, router, searchParams],
  );

  const getWidgetClassName = useCallback(
    (id: string) => (id === "topProducts" || id === "salesChart" ? "xl:col-span-2" : ""),
    [],
  );

  const renderWidget = useCallback(
    (id: string, reset: () => void) => {
      switch (id) {
        case "sales":
          return (
            <WidgetBoundary onReset={reset}>
              <Suspense fallback={<StatWidgetSkeleton />}>
                <SalesWidget branchId={analyticsBranch} />
              </Suspense>
            </WidgetBoundary>
          );
        case "topBranch":
          return (
            <WidgetBoundary onReset={reset}>
              <Suspense fallback={<StatWidgetSkeleton />}>
                <TopBranchWidget branchId={analyticsBranch} />
              </Suspense>
            </WidgetBoundary>
          );
        case "lowStock":
          return (
            <WidgetBoundary onReset={reset}>
              <Suspense fallback={<AlertsWidgetSkeleton />}>
                <LowStockWidget branchId={analyticsBranch} />
              </Suspense>
            </WidgetBoundary>
          );
        case "topProducts":
          return (
            <WidgetBoundary onReset={reset}>
              <Suspense fallback={<ChartWidgetSkeleton />}>
                <TopProductsWidget branchId={analyticsBranch} />
              </Suspense>
            </WidgetBoundary>
          );
        case "salesChart":
          return (
            <WidgetBoundary onReset={reset}>
              <Suspense fallback={<ChartWidgetSkeleton />}>
                <SalesChartWidget branchId={analyticsBranch} />
              </Suspense>
            </WidgetBoundary>
          );
        default:
          return null;
      }
    },
    [analyticsBranch],
  );

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Drag widgets from the top right corner to customize layout.</p>
        </div>
        <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
          Viewing: <span className="text-emerald-600 dark:text-emerald-400">{branchLabel}</span>
        </div>
      </div>

      {layoutReady ? (
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <DashboardSortableGridLazy
              widgetOrder={widgetOrder}
              onReorder={handleReorder}
              renderWidget={(id) => renderWidget(id, reset)}
              getWidgetClassName={getWidgetClassName}
            />
          )}
        </QueryErrorResetBoundary>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <StatWidgetSkeleton />
          <StatWidgetSkeleton />
          <AlertsWidgetSkeleton />
        </div>
      )}
    </AnimatedPage>
  );
}

export default function AnalyticsDashboard() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <StatWidgetSkeleton />
            <StatWidgetSkeleton />
          </div>
        </div>
      }
    >
      <AnalyticsDashboardContent />
    </Suspense>
  );
}
