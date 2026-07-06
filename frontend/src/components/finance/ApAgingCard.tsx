"use client";

import Link from "next/link";
import { useApAging } from "@/hooks/domains/useProcurementQueries";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/money";
import { financeSectionPanelClassName } from "@/lib/theme/finance";
import { inlineLinkClassName } from "@/lib/theme/hub-primitives";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";
import type { ApAging } from "@/types/api";

export function ApAgingCard() {
  const { data, isLoading } = useApAging() as {
    data?: ApAging;
    isLoading: boolean;
  };

  return (
    <section
      className={financeSectionPanelClassName()}
      aria-label="Accounts payable aging"
    >
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className={cn("text-base font-semibold", text.primary)}>
          Accounts payable
        </h2>
        <Link
          href="/procurement/orders?status=RECEIVED"
          className={inlineLinkClassName()}
        >
          View unpaid POs
        </Link>
      </div>

      {isLoading || !data ? (
        <Skeleton className="h-16 w-full" />
      ) : data.poCount === 0 ? (
        <p className={cn("text-sm", text.muted)}>
          No outstanding supplier invoices — every received PO is paid.
        </p>
      ) : (
        <div className="space-y-3">
          <p className={cn("text-sm", text.secondary)}>
            <span className={cn("text-lg font-semibold tabular-nums", text.primary)}>
              {formatCurrency(data.totalOutstanding)}
            </span>{" "}
            outstanding across {data.poCount} unpaid PO
            {data.poCount === 1 ? "" : "s"}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {data.buckets.map((bucket) => (
              <div
                key={bucket.range}
                className="rounded-lg border border-border/60 px-3 py-2"
              >
                <p className={cn("text-xs", text.muted)}>{bucket.range} days</p>
                <p className={cn("font-mono text-sm tabular-nums", text.primary)}>
                  {formatCurrency(bucket.amount)}
                </p>
                <p className={cn("text-xs", text.muted)}>
                  {bucket.count} PO{bucket.count === 1 ? "" : "s"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
