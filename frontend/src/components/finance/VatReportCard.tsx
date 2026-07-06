"use client";

import { useAuth } from "@/context/AuthContext";
import { useVatReport } from "@/hooks/domains/useNotificationQueries";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMonthYear } from "@/lib/intl-date";
import { formatCurrency } from "@/lib/money";
import { financeSectionPanelClassName } from "@/lib/theme/finance";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";
import type { VatReportMonth } from "@/types/api";

export function VatReportCard() {
  const { activeBranchId } = useAuth();
  const { data, isLoading } = useVatReport(activeBranchId ?? undefined) as {
    data?: VatReportMonth[];
    isLoading: boolean;
  };

  return (
    <section
      className={financeSectionPanelClassName()}
      aria-label="Output VAT summary"
    >
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className={cn("text-base font-semibold", text.primary)}>
          Output VAT (ภ.พ.30)
        </h2>
        <span className={cn("text-xs", text.muted)}>
          VAT-inclusive sales, last {data?.length ?? 6} months
        </span>
      </div>

      {isLoading || !data ? (
        <Skeleton className="h-24 w-full" />
      ) : data.length === 0 ? (
        <p className={cn("text-sm", text.muted)}>No sales recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={cn("text-left text-xs uppercase", text.muted)}>
                <th className="py-1.5 pr-3 font-medium">Month</th>
                <th className="py-1.5 pr-3 text-right font-medium">Sales (ex VAT)</th>
                <th className="py-1.5 pr-3 text-right font-medium">Output VAT</th>
                <th className="py-1.5 text-right font-medium">Gross</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {data.map((row) => (
                <tr key={row.month}>
                  <td className={cn("py-2 pr-3 tabular-nums", text.primary)}>
                    {formatMonthYear(row.month)}
                  </td>
                  <td className={cn("py-2 pr-3 text-right font-mono tabular-nums", text.secondary)}>
                    {formatCurrency(row.salesExVat)}
                  </td>
                  <td className={cn("py-2 pr-3 text-right font-mono tabular-nums font-medium", text.primary)}>
                    {formatCurrency(row.outputVat)}
                  </td>
                  <td className={cn("py-2 text-right font-mono tabular-nums", text.muted)}>
                    {formatCurrency(row.grossSales)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
