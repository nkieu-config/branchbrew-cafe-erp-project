"use client";

import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShiftGanttTimeline } from "@/components/hr/ShiftGanttTimeline";
import { ganttPanelClassName } from "@/lib/theme/hub-hr";
import { hubCtaClassName, hubLoadingSpinnerClassName } from "@/lib/theme/hub-primitives";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";
import type { ShiftUserRow } from "@/lib/filters/shift-filters";

type ShiftsSchedulePanelProps = {
  isLoading: boolean;
  isError: boolean;
  ganttRows: ShiftUserRow[];
  hasActiveFilters: boolean;
  shiftDateLabel: string;
  onScheduleShift: () => void;
};

export function ShiftsSchedulePanel({
  isLoading,
  isError,
  ganttRows,
  hasActiveFilters,
  shiftDateLabel,
  onScheduleShift,
}: ShiftsSchedulePanelProps) {
  return (
    <div className={ganttPanelClassName()}>
      {isLoading ? (
        <div className="flex h-56 items-center justify-center">
          <Loader2 className={hubLoadingSpinnerClassName("w-7 h-7")} aria-hidden />
          <span className="sr-only">Loading shift schedule…</span>
        </div>
      ) : !isError && ganttRows.length === 0 ? (
        <div className="py-14 text-center px-4">
          <p className={cn("font-medium", text.primary)}>
            {hasActiveFilters ? "No shifts match your filters" : "No shifts scheduled"}
          </p>
          <p className={cn("text-sm mt-1.5", text.muted)}>
            {hasActiveFilters
              ? "Try another date or filter."
              : `Nothing on ${shiftDateLabel}.`}
          </p>
          {!hasActiveFilters && (
            <Button className={cn("mt-5", hubCtaClassName("hr"))} onClick={onScheduleShift}>
              <Plus className="w-4 h-4 mr-2" aria-hidden />
              Schedule shift
            </Button>
          )}
        </div>
      ) : !isError ? (
        <ShiftGanttTimeline rows={ganttRows} />
      ) : null}
    </div>
  );
}
