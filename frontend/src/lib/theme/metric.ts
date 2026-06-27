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

export function metricValueClassName(tone: MetricTone) {
  return metricTextClass[tone];
}

export function metricIconWrapClassName(tone: MetricTone) {
  return cn("p-3 rounded-xl bg-muted", metricTextClass[tone]);
}

export function metricTrendClassName(positive: boolean) {
  return positive ? "text-[var(--metric-emerald)]" : "text-[var(--metric-red)]";
}
