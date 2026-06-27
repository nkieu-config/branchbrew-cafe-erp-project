import { readCssVar } from "./css-var";

export type ChartTheme = {
  grid: string;
  axis: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipFg: string;
  revenue: string;
  cursor: string;
};

export function getChartTheme(): ChartTheme {
  return {
    grid: readCssVar("--chart-grid", "#e2e8f0"),
    axis: readCssVar("--chart-axis", "#64748b"),
    tooltipBg: readCssVar("--chart-tooltip-bg", "#ffffff"),
    tooltipBorder: readCssVar("--chart-tooltip-border", "#e2e8f0"),
    tooltipFg: readCssVar("--chart-tooltip-fg", "#0f172a"),
    revenue: readCssVar("--chart-revenue", "#22c55e"),
    cursor: readCssVar("--chart-cursor", "#f1f5f9"),
  };
}

export function getChartPalette(): string[] {
  return [
    readCssVar("--chart-1", "#22c55e"),
    readCssVar("--chart-2", "#0ea5e9"),
    readCssVar("--chart-3", "#8b5cf6"),
    readCssVar("--chart-4", "#f59e0b"),
    readCssVar("--chart-5", "#ec4899"),
  ];
}
