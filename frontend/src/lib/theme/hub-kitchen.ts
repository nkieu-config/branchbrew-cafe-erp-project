import { cn } from "@/lib/utils";
import type { StatusTone } from "./status";
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

const kanbanColumnTopAccent: Partial<Record<StatusTone, string>> = {
  info: "border-t-[var(--status-info-fg)]",
  warning: "border-t-[var(--status-warning-fg)]",
  success: "border-t-[var(--status-success-fg)]",
  danger: "border-t-[var(--status-danger-fg)]",
  neutral: "border-t-[var(--table-container-border)]",
};

export function kanbanColumnClassName(isOver: boolean, tone: StatusTone, className?: string) {
  return cn(
    "flex flex-col min-w-[min(88vw,300px)] max-w-[320px] flex-1 shrink-0 snap-center rounded-xl border border-t-2 overflow-hidden transition-colors",
    kanbanColumnTopAccent[tone] ?? kanbanColumnTopAccent.neutral,
    "bg-[var(--form-line-bg)]",
    isOver
      ? "border-[var(--hub-kitchen)] bg-[var(--status-warning-bg)]/20"
      : "border-[var(--table-container-border)]",
    className,
  );
}

export function kitchenKanbanBoardClassName(className?: string) {
  return cn(
    "flex flex-1 min-h-0 gap-3 overflow-x-auto snap-x snap-mandatory pb-2",
    "min-h-[min(50dvh,480px)]",
    className,
  );
}

export function kanbanColumnHeaderClassName(className?: string) {
  return cn(
    "px-3 py-2.5 border-b border-[var(--table-container-border)]",
    "flex items-center justify-between text-sm font-medium",
    text.secondary,
    className,
  );
}

export function kanbanCardClassName(isOverlay?: boolean, className?: string) {
  return cn(
    "p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-shadow",
    "bg-[var(--table-container-bg)] border-[var(--table-container-border)]",
    "hover:shadow-sm",
    isOverlay && "shadow-lg scale-[1.02]",
    className,
  );
}

export function kanbanCompletedCardClassName(className?: string) {
  return cn("opacity-75 cursor-not-allowed", className);
}

export function kanbanOrderBadgeClassName(className?: string) {
  return cn("text-xs font-mono tabular-nums", text.muted, className);
}

export function kitchenMutedMetaClassName(className?: string) {
  return cn("text-xs", text.muted, className);
}
