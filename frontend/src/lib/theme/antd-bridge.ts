import type { ThemeConfig } from "antd";
import { theme as antdTheme } from "antd";
import { readThemeToken, resolveThemeMode } from "./css-var";
import { themeDefaults } from "./defaults";

/** Map CSS semantic tokens → antd ConfigProvider (keeps antd in sync with shadcn shell). */
export function getAntdThemeConfig(resolvedTheme: string | undefined): ThemeConfig {
  const mode = resolveThemeMode(resolvedTheme);
  const defaults = themeDefaults[mode];

  const colorPrimary = readThemeToken("--accent", mode, "accent");
  const colorBgContainer = readThemeToken("--card", mode, "card");
  const colorBgLayout = readThemeToken("--background", mode, "background");
  const colorText = readThemeToken("--foreground", mode, "foreground");
  const colorBorder = readThemeToken("--border", mode, "border");
  const borderRadius = defaults.radius;

  return {
    algorithm: mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      fontFamily: "inherit",
      colorPrimary,
      colorBgContainer,
      colorBgLayout,
      colorText,
      colorBorder,
      borderRadius,
      controlHeight: 40,
    },
    components: {
      Button: { controlHeight: 40, borderRadius },
      Input: { controlHeight: 40, borderRadius },
      Select: { controlHeight: 40, borderRadius },
      InputNumber: { controlHeight: 40, borderRadius },
      DatePicker: { controlHeight: 40, borderRadius },
    },
  };
}
