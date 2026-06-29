import { Skeleton } from "@/components/ui/skeleton";

export function FinanceTableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-2">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}
