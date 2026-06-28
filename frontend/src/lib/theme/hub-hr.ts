import { cn } from "@/lib/utils";
import { metricValueClassName } from "./metric";
import { text } from "./surface";
import { expandedRowPanelClassName } from "./hub-primitives";

export function ganttPanelClassName(className?: string) {
  return cn(
    "rounded-2xl shadow-sm border overflow-hidden flex flex-col",
    "bg-[var(--table-container-bg)] border-[var(--table-container-border)]",
    className,
  );
}

export function ganttHeaderClassName(className?: string) {
  return cn(
    "p-4 border-b flex justify-between items-center",
    "bg-[var(--table-head-bg)] border-[var(--table-container-border)]",
    className,
  );
}

export function ganttTimeAxisClassName(className?: string) {
  return cn("flex ml-40 border-b pb-2 relative border-[var(--table-row-border)]", className);
}

export function ganttHourLabelClassName(className?: string) {
  return cn("flex-1 text-xs font-bold text-center relative", text.muted, className);
}

export function ganttHourMarkerClassName(className?: string) {
  return cn(
    "absolute top-0 px-1 z-10 bg-[var(--table-container-bg)]",
    className,
  );
}

export function ganttGridLineClassName(className?: string) {
  return cn("flex-1 border-l border-dashed border-[var(--table-row-border)]", className);
}

export function ganttUserColumnClassName(className?: string) {
  return cn(
    "w-40 flex items-center gap-2 pr-4 shrink-0 border-r z-10 transition-colors",
    "border-[var(--table-row-border)] bg-[var(--table-container-bg)] group-hover:bg-[var(--table-row-hover)]",
    className,
  );
}

export function ganttTrackClassName(className?: string) {
  return cn(
    "flex-1 h-full relative transition-colors rounded-r-xl group-hover:bg-[var(--table-row-hover)]",
    className,
  );
}

export type ShiftBarStatus = "scheduled" | "COMPLETED" | "ABSENT" | "CANCELLED";

const shiftBarClass: Record<ShiftBarStatus, string> = {
  scheduled:
    "bg-[var(--status-info-bg)] border-[var(--status-info-fg)]/30 text-[var(--status-info-fg)]",
  COMPLETED:
    "bg-[var(--metric-emerald)] border-[var(--metric-emerald)] text-[var(--on-metric-emerald-fg)]",
  ABSENT:
    "bg-[var(--metric-red)] border-[var(--metric-red)] text-[var(--on-metric-red-fg)]",
  CANCELLED:
    "bg-[var(--status-neutral-bg)] border-[var(--tone-neutral-border)] text-[var(--status-neutral-fg)]",
};

function shiftBarStatusKey(status: string): ShiftBarStatus {
  if (status === "COMPLETED") return "COMPLETED";
  if (status === "ABSENT") return "ABSENT";
  if (status === "CANCELLED") return "CANCELLED";
  return "scheduled";
}

export function shiftBarClassName(status: string, className?: string) {
  return cn(
    "absolute top-1 bottom-1 rounded-md border text-xs font-bold",
    "flex items-center justify-center overflow-hidden shadow-sm",
    "transition-transform motion-reduce:transition-none hover:scale-[1.02] motion-reduce:hover:scale-100 cursor-pointer z-20",
    shiftBarClass[shiftBarStatusKey(status)],
    className,
  );
}

export function hrAvatarClassName(className?: string) {
  return cn(
    "font-bold shrink-0 bg-[var(--hub-hr)] text-[var(--hub-hr-fg)]",
    className,
  );
}

export function attendanceLateRowClassName(className?: string) {
  return cn("bg-[var(--status-danger-bg)]/50", className);
}

export function attendanceOnTimeClassName(className?: string) {
  return cn("font-mono font-bold", metricValueClassName("emerald"), className);
}

export function attendanceLateTimeClassName(className?: string) {
  return cn("font-mono font-bold", metricValueClassName("red"), className);
}

export function payrollExpandedPanelClassName(className?: string) {
  return expandedRowPanelClassName(className);
}

export function payrollSummaryRowClassName(className?: string) {
  return cn("font-bold bg-[var(--table-summary-bg)]", className);
}
