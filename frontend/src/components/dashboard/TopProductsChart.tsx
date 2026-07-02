"use client";

import { useEffect, useMemo, useState } from "react";
import { Award } from "lucide-react";
import { getChartPalette } from "@/lib/theme/chart-styles";
import { decorativeIconClassName } from "@/lib/theme/color-helpers";
import { dashboardChartEmptyClass } from "@/lib/theme/dashboard";
import { text } from "@/lib/theme/surface";
import { typeUiLabelClassName } from "@/lib/theme/typography";
import { useChartTheme } from "@/hooks/useChartTheme";
import { cn } from "@/lib/utils";

type TopProduct = { name: string; totalQuantity: number };

function TopProductsRankedList({
  data,
  colors,
}: {
  data: TopProduct[];
  colors: string[];
}) {
  const maxQty = useMemo(
    () => Math.max(...data.map((item) => item.totalQuantity), 1),
    [data],
  );

  return (
    <ul className="flex min-h-[220px] flex-col justify-center gap-4 py-1 sm:gap-5 sm:py-2 lg:min-h-[260px]">
      {data.map((item, index) => {
        const pct = Math.round((item.totalQuantity / maxQty) * 100);
        const color = colors[index % colors.length];

        return (
          <li key={`${item.name}-${index}`} className="min-w-0">
            <div className="mb-1.5 flex items-baseline justify-between gap-3 sm:mb-2">
              <div className="flex min-w-0 items-baseline gap-2 sm:gap-2.5">
                <span
                  className={cn(
                    "shrink-0 text-xs font-semibold tabular-nums sm:text-sm",
                    text.muted,
                  )}
                >
                  #{index + 1}
                </span>
                <span
                  className={cn(
                    "truncate text-sm font-semibold sm:text-base",
                    text.primary,
                  )}
                  title={item.name}
                >
                  {item.name}
                </span>
              </div>
              <div className="flex shrink-0 items-baseline gap-2">
                <span
                  className={cn(
                    "hidden text-xs font-medium tabular-nums sm:inline",
                    text.muted,
                  )}
                >
                  {pct}%
                </span>
                <span className={cn("text-sm font-semibold tabular-nums sm:text-base", text.primary)}>
                  {item.totalQuantity}
                  <span className={cn("ml-1 text-xs font-medium sm:text-sm", text.muted)}>sold</span>
                </span>
              </div>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-muted)] sm:h-3">
              <div
                className="h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none"
                style={{ width: `${pct}%`, backgroundColor: color }}
                role="presentation"
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function TopProductsChart({ data }: { data: TopProduct[] }) {
  const chartTheme = useChartTheme();
  const [colors, setColors] = useState<string[]>(() => getChartPalette());

  useEffect(() => {
    setColors(getChartPalette());
  }, [chartTheme]);

  if (data.length === 0) {
    return (
      <div className={dashboardChartEmptyClass("h-full min-h-[220px] lg:min-h-[260px]")}>
        <Award className={decorativeIconClassName("w-10 h-10")} aria-hidden />
        <p className={cn(typeUiLabelClassName("text-sm"), text.primary)}>No sales recorded today</p>
        <p className={cn("text-sm", text.muted)}>Best sellers will appear once items are sold.</p>
      </div>
    );
  }

  return <TopProductsRankedList data={data} colors={colors} />;
}
