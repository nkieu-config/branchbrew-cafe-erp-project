/**
 * Fallback token values for SSR and libraries that cannot read CSS variables (e.g. antd initial render).
 * Keep in sync with frontend/src/app/globals.css (:root and .dark).
 */
export const themeDefaults = {
  light: {
    accent: "#d4842a",
    accentForeground: "#ffffff",
    background: "#f7f7f4",
    foreground: "#26251e",
    card: "#ffffff",
    cardForeground: "#26251e",
    muted: "#ebeae5",
    mutedForeground: "#6b675c",
    border: "#e6e5e0",
    destructive: "#cf2d56",
    destructiveForeground: "#ffffff",
    chart1: "#d4842a",
    chart2: "#7ec8b8",
    chart3: "#b8a9c9",
    chart4: "#e8a87c",
    chart5: "#7a5540",
    success: "#1f8a65",
    semanticSuccess: "#1f8a65",
    radius: 12,
  },
  dark: {
    accent: "#d4842a",
    accentForeground: "#ffffff",
    background: "#1a1814",
    foreground: "#f7f7f4",
    card: "#222019",
    cardForeground: "#f7f7f4",
    muted: "#3d3b33",
    mutedForeground: "#a09c92",
    border: "#4a4740",
    destructive: "#cf2d56",
    destructiveForeground: "#ffffff",
    chart1: "#d4842a",
    chart2: "#7ec8b8",
    chart3: "#b8a9c9",
    chart4: "#e8a87c",
    chart5: "#b8a088",
    success: "#1f8a65",
    semanticSuccess: "#1f8a65",
    radius: 12,
  },
} as const;

export type ThemeMode = keyof typeof themeDefaults;
