import { dashboardGridClass } from "@/lib/theme/dashboard";
import { cn } from "@/lib/utils";
import {
  StatWidgetSkeleton,
  AlertsWidgetSkeleton,
  ChartWidgetSkeleton,
} from "@/components/dashboard/widgets/WidgetSkeletons";

export function DashboardLayoutSkeleton() {
  return (
    <div className={dashboardGridClass()}>
      <StatWidgetSkeleton />
      <StatWidgetSkeleton />
      <AlertsWidgetSkeleton />
      <ChartWidgetSkeleton className="md:col-span-2 xl:col-span-2" />
      <ChartWidgetSkeleton className={cn("md:col-span-2 xl:col-span-2")} />
    </div>
  );
}
