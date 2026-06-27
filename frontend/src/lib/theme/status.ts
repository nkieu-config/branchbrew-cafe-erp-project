import { cn } from "@/lib/utils";

export type StatusTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "purple"
  | "blue"
  | "category";

const toneClass: Record<StatusTone, string> = {
  neutral: "bg-[var(--status-neutral-bg)] text-[var(--status-neutral-fg)]",
  info: "bg-[var(--status-info-bg)] text-[var(--status-info-fg)]",
  success: "bg-[var(--status-success-bg)] text-[var(--status-success-fg)]",
  warning: "bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)]",
  danger: "bg-[var(--status-danger-bg)] text-[var(--status-danger-fg)]",
  purple: "bg-[var(--status-purple-bg)] text-[var(--status-purple-fg)]",
  blue: "bg-[var(--status-blue-bg)] text-[var(--status-blue-fg)]",
  category:
    "bg-[var(--status-neutral-bg)] text-[var(--status-neutral-fg)] border-[var(--border)]",
};

export function statusToneClassName(tone: StatusTone, className?: string) {
  return cn(toneClass[tone], className);
}
