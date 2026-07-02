/**
 * Fallback token values for SSR and libraries that cannot read CSS variables (e.g. antd initial render).
 * Derived from primitives.ts — do not edit values here directly.
 */
import { themePrimitives } from "./primitives";

const light = themePrimitives.light;
const dark = themePrimitives.dark;

export const themeDefaults = {
  light: {
    accent: light.accent,
    accentForeground: light.accentForeground,
    background: light.background,
    foreground: light.foreground,
    card: light.card,
    cardForeground: light.cardForeground,
    muted: light.muted,
    mutedForeground: light.mutedForeground,
    border: light.border,
    destructive: light.destructive,
    destructiveForeground: light.destructiveForeground,
    chart1: light.chart1,
    chart2: light.chart2,
    chart3: light.chart3,
    chart4: light.chart4,
    chart5: light.chart5,
    success: light.success,
    semanticSuccess: light.success,
    radius: 12,
  },
  dark: {
    accent: dark.accent,
    accentForeground: dark.accentForeground,
    background: dark.background,
    foreground: dark.foreground,
    card: dark.card,
    cardForeground: dark.cardForeground,
    muted: dark.muted,
    mutedForeground: dark.mutedForeground,
    border: dark.border,
    destructive: dark.destructive,
    destructiveForeground: dark.destructiveForeground,
    chart1: dark.chart1,
    chart2: dark.chart2,
    chart3: dark.chart3,
    chart4: dark.chart4,
    chart5: dark.chart5,
    success: dark.success,
    semanticSuccess: dark.success,
    radius: 12,
  },
} as const;

export type ThemeMode = keyof typeof themeDefaults;
