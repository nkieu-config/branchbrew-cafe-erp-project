import { cn } from "@/lib/utils";
import type { StatusTone } from "./status";
import { statusToneClassName } from "./status";
import { text } from "./surface";

export {
  kitchenDialogContentClassName,
  kitchenMetaBadgeClassName,
  kitchenSectionPanelClassName,
} from "./hub-section-aliases";

export function productionColumnTone(status: string): StatusTone {
  switch (status) {
    case "PLANNED":
      return "info";
    case "IN_PROGRESS":
      return "warning";
    case "COMPLETED":
      return "success";
    default:
      return "neutral";
  }
}

export function kanbanColumnClassName(isOver: boolean, className?: string) {
  return cn(
    "flex flex-col min-w-[min(88vw,320px)] max-w-[350px] flex-1 shrink-0 snap-center rounded-2xl border overflow-hidden transition-colors",
    "bg-[var(--form-line-bg)]",
    isOver
      ? "border-[var(--hub-kitchen)] bg-[var(--status-warning-bg)]/30"
      : "border-[var(--table-container-border)]",
    className,
  );
}

export function kitchenKanbanBoardClassName(className?: string) {
  return cn(
    "flex flex-1 min-h-0 gap-4 overflow-x-auto snap-x snap-mandatory pb-4",
    "min-h-[min(55dvh,520px)]",
    className,
  );
}

export function kanbanColumnHeaderClassName(tone: StatusTone, className?: string) {
  return cn(
    "p-4 border-b font-bold flex items-center justify-between",
    "border-[var(--table-container-border)]",
    statusToneClassName(tone),
    className,
  );
}

export function kanbanCardClassName(isOverlay?: boolean, className?: string) {
  return cn(
    "p-4 rounded-xl shadow-sm border cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow",
    "bg-[var(--table-container-bg)] border-[var(--table-container-border)]",
    isOverlay && "shadow-xl scale-105 rotate-2",
    className,
  );
}

export function kanbanCompletedCardClassName(className?: string) {
  return cn(
    "opacity-80 ring-1 ring-dashed ring-[var(--border)] cursor-not-allowed",
    className,
  );
}

export function kanbanOrderBadgeClassName(className?: string) {
  return cn(
    "text-xs font-bold font-mono px-2 py-0.5 rounded-md",
    "text-muted-foreground bg-[var(--table-head-bg)]",
    className,
  );
}

export function kanbanMetaChipClassName(className?: string) {
  return cn(
    "mt-3 text-xs flex items-center gap-1 font-medium w-fit px-2 py-1 rounded-md",
    text.subtle,
    "bg-[var(--form-line-bg)]",
    className,
  );
}
