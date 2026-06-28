import { themeDefaults, type ThemeMode } from "./defaults";

/** Read a CSS custom property from :root (client only). */
export function readCssVar(name: `--${string}`, fallback = ""): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export function resolveThemeMode(resolvedTheme: string | undefined): ThemeMode {
  return resolvedTheme === "dark" ? "dark" : "light";
}

function domThemeMatchesMode(mode: ThemeMode): boolean {
  if (typeof window === "undefined") return false;
  return document.documentElement.classList.contains("dark") === (mode === "dark");
}

export function readThemeToken(
  name: `--${string}`,
  mode: ThemeMode,
  tokenKey: keyof (typeof themeDefaults)["light"],
): string {
  /** Avoid baking the previous theme when html.dark and resolvedTheme are briefly out of sync. */
  if (domThemeMatchesMode(mode)) {
    const fromCss = readCssVar(name);
    if (fromCss) return fromCss;
  }
  const value = themeDefaults[mode][tokenKey];
  return typeof value === "number" ? String(value) : value;
}
