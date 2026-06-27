/**
 * Fallback token values for SSR and libraries that cannot read CSS variables (e.g. antd initial render).
 * Keep in sync with frontend/src/styles/theme/tokens.css
 */
export const themeDefaults = {
  light: {
    accent: "#22c55e",
    background: "#f8fafc",
    foreground: "#0f172a",
    card: "#ffffff",
    muted: "#f1f5f9",
    mutedForeground: "#64748b",
    border: "#e2e8f0",
    radius: 12,
  },
  dark: {
    accent: "#22c55e",
    background: "#020617",
    foreground: "#f8fafc",
    card: "#0f172a",
    muted: "#1e293b",
    mutedForeground: "#94a3b8",
    border: "#1e293b",
    radius: 12,
  },
} as const;

export type ThemeMode = keyof typeof themeDefaults;
