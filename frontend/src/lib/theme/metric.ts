import { cn } from "@/lib/utils";

export type MetricTone =
  | "emerald"
  | "blue"
  | "red"
  | "amber"
  | "indigo"
  | "purple"
  | "slate";

const metricTextClass: Record<MetricTone, string> = {
  emerald: "text-[var(--metric-emerald)]",
  blue: "text-[var(--metric-blue)]",
  red: "text-[var(--metric-red)]",
  amber: "text-[var(--metric-amber)]",
  indigo: "text-[var(--metric-indigo)]",
  purple: "text-[var(--metric-purple)]",
  slate: "text-[var(--metric-slate)]",
};

/** Icon/text on status-soft surfaces — readable fg paired with tone bg. */
const metricOnSoftClass: Record<MetricTone, string> = {
  emerald: "text-[var(--status-success-fg)]",
  blue: "text-[var(--status-blue-fg)]",
  red: "text-[var(--status-danger-fg)]",
  amber: "text-[var(--status-warning-fg)]",
  indigo: "text-[var(--status-purple-fg)]",
  purple: "text-[var(--status-purple-fg)]",
  slate: "text-[var(--status-neutral-fg)]",
};

const metricSoftBgClass: Record<MetricTone, string> = {
  emerald: "bg-[var(--status-success-bg)]",
  blue: "bg-[var(--status-blue-bg)]",
  red: "bg-[var(--status-danger-bg)]",
  amber: "bg-[var(--status-warning-bg)]",
  indigo: "bg-[var(--status-purple-bg)]",
  purple: "bg-[var(--status-purple-bg)]",
  slate: "bg-[var(--status-neutral-bg)]",
};

export function metricValueClassName(tone: MetricTone) {
  return metricTextClass[tone];
}

export function metricIconWrapClassName(tone: MetricTone, className?: string) {
  return cn(
    "p-3 rounded-xl",
    metricSoftBgClass[tone],
    metricOnSoftClass[tone],
    className,
  );
}

export function metricTrendClassName(positive: boolean) {
  return positive ? "text-[var(--metric-emerald)]" : "text-[var(--metric-red)]";
}
