"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Calendar, Popover } from "antd";
import { CalendarDays, AlertCircle } from "lucide-react";
import { differenceInDays } from "date-fns";
import { formatIsoDate } from "@/lib/intl-date";
import { isTrackableBatch } from "@/lib/inventory-alerts";
import {
  expiryCalendarShellClassName,
  expiryCellClassName,
  expiryHeatmapHeaderClassName,
  expiryHeatmapPanelClassName,
  expiryHeatmapPopoverClassName,
  expiryLegendDotClassName,
  expiryUrgency,
  metricValueClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Dayjs } from "dayjs";
import type { InventoryBatch, Ingredient, PurchaseOrder, Supplier } from "@/types/api";

type BatchWithSupplier = InventoryBatch & {
  purchaseOrder?: PurchaseOrder & { supplier?: Supplier };
  ingredient?: Ingredient;
};

type ExpiryHeatmapPanelProps = {
  batches: BatchWithSupplier[];
};

function batchIngredientLabel(batch: BatchWithSupplier) {
  return batch.ingredient?.name ?? `#${batch.ingredientId}`;
}

export function ExpiryHeatmapPanel({ batches }: ExpiryHeatmapPanelProps) {
  const { resolvedTheme } = useTheme();
  const themeKey = resolvedTheme ?? "light";
  const [calendarMode, setCalendarMode] = useState<"month" | "year">("month");
  const [openDate, setOpenDate] = useState<string | null>(null);

  useEffect(() => {
    setOpenDate(null);
  }, [themeKey]);

  const trackableBatches = batches.filter(isTrackableBatch);

  const expiryMap = trackableBatches.reduce(
    (acc: Record<string, BatchWithSupplier[]>, batch: BatchWithSupplier) => {
      if (!batch.expiryDate) return acc;
      const dateStr = formatIsoDate(batch.expiryDate);
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(batch);
      return acc;
    },
    {},
  );

  const dateCellRender = (value: Dayjs) => {
    const dateStr = value.format("YYYY-MM-DD");
    const expiringBatches = expiryMap[dateStr];
    if (!expiringBatches) return null;

    const daysLeft = differenceInDays(value.toDate(), new Date());
    const urgency = expiryUrgency(daysLeft);
    const label = `${expiringBatches.length} item${expiringBatches.length === 1 ? "" : "s"} expiring`;

    const popoverContent = (
      <div className="max-w-xs space-y-2">
        <div className={`font-black border-b pb-1 mb-2 ${text.primary}`}>Expiring Items</div>
        {expiringBatches.map((b) => (
          <div key={b.id} className="flex justify-between items-center text-sm gap-4">
            <span className={`font-semibold ${text.secondary}`}>{batchIngredientLabel(b)}</span>
            <span className="font-mono bg-[var(--form-line-bg)] px-1 rounded">
              {b.quantity} {b.ingredient?.unit ?? ""}
            </span>
          </div>
        ))}
      </div>
    );

    return (
      <Popover
        key={`${dateStr}-${themeKey}`}
        content={popoverContent}
        title={null}
        trigger="click"
        open={openDate === dateStr}
        onOpenChange={(open) => setOpenDate(open ? dateStr : null)}
        overlayClassName={expiryHeatmapPopoverClassName()}
        destroyOnHidden
      >
        <button
          type="button"
          className={cn(expiryCellClassName(urgency), "border-0 cursor-pointer w-full")}
          aria-label={label}
        >
          <AlertCircle className="w-4 h-4 mb-1" aria-hidden />
          <span className="text-[10px] font-black leading-none">{expiringBatches.length} Items</span>
        </button>
      </Popover>
    );
  };

  return (
    <div className={expiryHeatmapPanelClassName()}>
      <div className={expiryHeatmapHeaderClassName()}>
        <CalendarDays className={`w-5 h-5 ${metricValueClassName("red")}`} aria-hidden />
        Expiry Heatmap
      </div>
      <div className="p-4">
        <Calendar
          key={themeKey}
          fullscreen={false}
          mode={calendarMode}
          onPanelChange={(_, mode) => {
            setCalendarMode(mode === "year" ? "month" : mode);
          }}
          cellRender={(current, info) => {
            if (info.type === "date") return dateCellRender(current);
            return info.originNode;
          }}
          className={expiryCalendarShellClassName(
            "rounded-xl border border-[var(--table-row-border)] overflow-hidden",
          )}
        />
        <p className={`mt-3 text-xs ${text.muted}`}>
          Day view only — use month navigation to browse expiry dates. Only batches with remaining
          quantity are shown.
        </p>
        <div className="mt-6 space-y-2">
          <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${text.muted}`}>
            Legend
          </div>
          <div className={`flex items-center gap-2 text-sm font-medium ${text.secondary}`}>
            <div className={expiryLegendDotClassName("expired")} aria-hidden />
            Expired
          </div>
          <div className={`flex items-center gap-2 text-sm font-medium ${text.secondary}`}>
            <div className={expiryLegendDotClassName("critical")} aria-hidden />
            Critical (0–1 days)
          </div>
          <div className={`flex items-center gap-2 text-sm font-medium ${text.secondary}`}>
            <div className={expiryLegendDotClassName("warning")} aria-hidden />
            Warning (2–3 days)
          </div>
          <div className={`flex items-center gap-2 text-sm font-medium ${text.secondary}`}>
            <div className={expiryLegendDotClassName("notice")} aria-hidden />
            Notice (4–7 days)
          </div>
          <div className={`flex items-center gap-2 text-sm font-medium ${text.secondary}`}>
            <div className={expiryLegendDotClassName("safe")} aria-hidden />
            Safe (8+ days)
          </div>
          <p className={`pt-2 text-xs ${text.muted}`}>
            Safe appears on dates with batches expiring 8+ days out — empty days have no cell.
          </p>
        </div>
      </div>
    </div>
  );
}
