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
