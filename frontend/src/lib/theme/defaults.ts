/**
 * Fallback token values for SSR and libraries that cannot read CSS variables (e.g. antd initial render).
 * Keep in sync with frontend/src/app/globals.css (:root and .dark).
 */
export const themeDefaults = {
  light: {
    accent: "#22C55E",
    accentForeground: "#FFFFFF",
    background: "#F8FAFC",
    foreground: "#0F172A",
    card: "#FFFFFF",
    cardForeground: "#0F172A",
    muted: "#F1F5F9",
    mutedForeground: "#64748B",
    border: "#E2E8F0",
    destructive: "#EF4444",
    destructiveForeground: "#FFFFFF",
    chart1: "#22C55E",
    chart2: "#0EA5E9",
    chart3: "#8B5CF6",
    chart4: "#F59E0B",
    chart5: "#EC4899",
    radius: 12,
  },
  dark: {
    accent: "#22C55E",
    accentForeground: "#020617",
    background: "#020617",
    foreground: "#F8FAFC",
    card: "#0F172A",
    cardForeground: "#F8FAFC",
    muted: "#1E293B",
    mutedForeground: "#94A3B8",
    border: "#1E293B",
    destructive: "#7f1d1d",
    destructiveForeground: "#f8fafc",
    chart1: "#22C55E",
    chart2: "#0EA5E9",
    chart3: "#8B5CF6",
    chart4: "#F59E0B",
    chart5: "#EC4899",
    radius: 12,
  },
} as const;

export type ThemeMode = keyof typeof themeDefaults;
