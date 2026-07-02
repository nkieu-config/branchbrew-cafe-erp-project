import { dashboardSkeletonClass } from "@/lib/theme/dashboard";
import { cn } from "@/lib/utils";

export function StatWidgetSkeleton() {
  return <div className={dashboardSkeletonClass("h-full min-h-[120px]")} />;
}

export function AlertsWidgetSkeleton() {
  return <div className={dashboardSkeletonClass("h-[240px]")} />;
}

export function ChartWidgetSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={dashboardSkeletonClass(
        cn("min-h-[340px] h-auto sm:min-h-0 sm:h-[340px] lg:h-[380px]", className),
      )}
    />
  );
}
