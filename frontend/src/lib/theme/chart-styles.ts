import { readCssVar } from "./css-var";
import { themeDefaults } from "./defaults";

export type ChartTheme = {
  grid: string;
  axis: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipFg: string;
  revenue: string;
  cursor: string;
};

const light = themeDefaults.light;

export function getChartTheme(): ChartTheme {
  return {
    grid: readCssVar("--chart-grid", light.border),
    axis: readCssVar("--chart-axis", light.mutedForeground),
    tooltipBg: readCssVar("--chart-tooltip-bg", light.card),
    tooltipBorder: readCssVar("--chart-tooltip-border", light.border),
    tooltipFg: readCssVar("--chart-tooltip-fg", light.foreground),
    revenue: readCssVar("--chart-revenue", light.chart1),
    cursor: readCssVar("--chart-cursor", light.muted),
  };
}

export function getChartPalette(): string[] {
  return [
    readCssVar("--chart-1", light.chart1),
    readCssVar("--chart-2", light.chart2),
    readCssVar("--chart-3", light.chart3),
    readCssVar("--chart-4", light.chart4),
    readCssVar("--chart-5", light.chart5),
  ];
}
