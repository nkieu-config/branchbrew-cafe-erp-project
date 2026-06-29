"use client";

import { CalendarDays, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShiftGanttTimeline } from "@/components/hr/ShiftGanttTimeline";
import { ganttPanelClassName } from "@/lib/theme/hub-hr";
import { hubCardIconFor, hubCtaClassName, hubLoadingSpinnerClassName } from "@/lib/theme/hub-primitives";
import { text } from "@/lib/theme/surface";
import { typeUiLabelClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";
import type { ShiftUserRow } from "@/lib/shift-filters";

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
        <div className="flex h-64 items-center justify-center">
          <Loader2 className={hubLoadingSpinnerClassName("w-8 h-8")} aria-hidden />
          <span className="sr-only">Loading shift schedule…</span>
        </div>
      ) : !isError && ganttRows.length === 0 ? (
        <div className="py-16 text-center px-4">
          <CalendarDays className={hubCardIconFor("hr", "w-12 h-12 mx-auto mb-4")} />
          <p className={typeUiLabelClassName(text.primary)}>
            {hasActiveFilters ? "No shifts match your filters" : "No shifts scheduled"}
          </p>
          <p className={cn("text-sm mt-2 max-w-md mx-auto", text.muted)}>
            {hasActiveFilters
              ? "Try another date, status, or employee filter."
              : `No shifts on ${shiftDateLabel}. Schedule a block to populate the timeline.`}
          </p>
          {!hasActiveFilters && (
            <Button className={cn("mt-6", hubCtaClassName("hr"))} onClick={onScheduleShift}>
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
