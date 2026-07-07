import { readCssVar } from "./css-var";
import { themeDefaults } from "./defaults";

export type ChartTheme = {
  grid: string;
  axis: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipFg: string;
  tooltipShadow: string;
  revenue: string;
  orders: string;
  cursor: string;
};

/** Semantic series keys mapped to palette slots (see globals.css --chart-*). */
export const chartSeriesKeys = [
  "revenue",
  "procurement",
  "hr",
  "kitchen",
  "products",
] as const;

export type ChartSeriesKey = (typeof chartSeriesKeys)[number];

const light = themeDefaults.light;

export function getChartTheme(): ChartTheme {
  return {
    grid: readCssVar("--chart-grid", light.border),
    axis: readCssVar("--chart-axis", light.mutedForeground),
    tooltipBg: readCssVar("--chart-tooltip-bg", light.card),
    tooltipBorder: readCssVar("--chart-tooltip-border", light.border),
    tooltipFg: readCssVar("--chart-tooltip-fg", light.foreground),
    tooltipShadow: readCssVar("--chart-tooltip-shadow", "0 4px 6px rgb(0 0 0 / 0.1)"),
    revenue: readCssVar("--chart-revenue", light.chart1),
    orders: readCssVar("--chart-2", light.chart2),
    cursor: readCssVar("--chart-cursor", light.muted),
  };
}

/** Ordered café palette: caramel → mint → lavender → peach → deep umber. */
export function getChartPalette(): string[] {
  return [
    readCssVar("--chart-1", light.chart1),
    readCssVar("--chart-2", light.chart2),
    readCssVar("--chart-3", light.chart3),
    readCssVar("--chart-4", light.chart4),
    readCssVar("--chart-5", light.chart5),
  ];
}

export function getChartSeriesColor(key: ChartSeriesKey): string {
  const palette = getChartPalette();
  const index = chartSeriesKeys.indexOf(key);
  return palette[index] ?? palette[0];
}
