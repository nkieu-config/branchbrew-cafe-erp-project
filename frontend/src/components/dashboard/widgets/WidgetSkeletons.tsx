import { dashboardSkeletonClass } from "@/lib/theme";

export function StatWidgetSkeleton() {
  return <div className={dashboardSkeletonClass("h-full min-h-[180px]")} />;
}

export function AlertsWidgetSkeleton() {
  return <div className={dashboardSkeletonClass("h-[300px]")} />;
}

export function ChartWidgetSkeleton() {
  return <div className={dashboardSkeletonClass("h-[400px]")} />;
}
