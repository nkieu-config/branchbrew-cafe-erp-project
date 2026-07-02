import { cn } from "@/lib/utils";
import { text } from "./surface";
import { expandedRowPanelClassName } from "./hub-primitives";

export {
  hrDialogContentClassName,
  hrMetaBadgeClassName,
  hrSectionPanelClassName,
} from "./hub-panel";

export function hrMutedMetaClassName(className?: string) {
  return cn("text-sm", text.muted, className);
}

export function ganttPanelClassName(className?: string) {
  return cn(
    "rounded-xl border overflow-hidden flex flex-col",
    "bg-[var(--table-container-bg)] border-[var(--table-container-border)]",
    className,
  );
}

export function ganttHeaderClassName(className?: string) {
  return cn(
    "px-4 py-3 border-b flex justify-between items-center",
    "bg-[var(--table-head-bg)] border-[var(--table-container-border)]",
    className,
  );
}

export function ganttTimeAxisClassName(className?: string) {
  return cn("flex ml-32 sm:ml-36 border-b pb-2 relative border-[var(--table-row-border)]", className);
}

export function ganttHourLabelClassName(className?: string) {
  return cn("flex-1 text-xs text-center relative", text.muted, className);
}

export function ganttHourMarkerClassName(className?: string) {
  return cn(
    "absolute top-0 px-1 z-10 bg-[var(--table-container-bg)] tabular-nums",
    className,
  );
}

export function ganttGridLineClassName(className?: string) {
  return cn("flex-1 border-l border-dashed border-[var(--table-row-border)]", className);
}

export function ganttUserColumnClassName(className?: string) {
  return cn(
    "w-32 sm:w-36 flex items-center gap-2 pr-3 shrink-0 border-r z-10",
    "border-[var(--table-row-border)] bg-[var(--table-container-bg)]",
    className,
  );
}

export function ganttTrackClassName(className?: string) {
  return cn("flex-1 h-full relative rounded-r-lg", className);
}

export type ShiftBarStatus = "scheduled" | "COMPLETED" | "ABSENT" | "CANCELLED";

const shiftBarClass: Record<ShiftBarStatus, string> = {
  scheduled:
    "bg-[var(--status-info-bg)] border-[var(--status-info-fg)]/25 text-[var(--status-info-fg)]",
  COMPLETED:
    "bg-[var(--status-success-bg)] border-[var(--status-success-fg)]/25 text-[var(--status-success-fg)]",
  ABSENT:
    "bg-[var(--status-danger-bg)] border-[var(--status-danger-fg)]/25 text-[var(--status-danger-fg)]",
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
    "absolute top-1 bottom-1 rounded-md border text-xs font-medium",
    "flex items-center justify-center overflow-hidden",
    "transition-transform motion-reduce:transition-none hover:scale-[1.01] motion-reduce:hover:scale-100 cursor-default z-20",
    shiftBarClass[shiftBarStatusKey(status)],
    className,
  );
}

export function hrAvatarClassName(className?: string) {
  return cn(
    "font-semibold shrink-0 text-sm bg-[var(--hub-hr)] text-[var(--hub-hr-fg)]",
    className,
  );
}

export function attendanceLateRowClassName(className?: string) {
  return cn("bg-[var(--status-danger-bg)]/30", className);
}

export function attendanceOnTimeClassName(className?: string) {
  return cn("tabular-nums", text.primary, className);
}

export function attendanceLateTimeClassName(className?: string) {
  return cn("tabular-nums text-[var(--status-danger-fg)]", className);
}

export function payrollExpandedPanelClassName(className?: string) {
  return expandedRowPanelClassName(className);
}

export function payrollSummaryRowClassName(className?: string) {
  return cn("font-medium bg-[var(--table-summary-bg)]", className);
}

export function payrollOtMetricClassName(className?: string) {
  return cn("tabular-nums", text.secondary, className);
}

export function payrollDeductionClassName(className?: string) {
  return cn("tabular-nums", text.muted, className);
}

export function payrollNetPayClassName(className?: string) {
  return cn("tabular-nums font-medium", text.primary, className);
}
