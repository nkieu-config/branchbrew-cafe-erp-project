import type { ThemeConfig } from "antd";
import { theme as antdTheme } from "antd";
import { readThemeToken, resolveThemeMode } from "./css-var";
import { themeDefaults } from "./defaults";

/** Map CSS semantic tokens → antd ConfigProvider (keeps antd in sync with shadcn shell). */
export function getAntdThemeConfig(resolvedTheme: string | undefined): ThemeConfig {
  const mode = resolveThemeMode(resolvedTheme);
  const defaults = themeDefaults[mode];

  const colorPrimary = readThemeToken("--accent", mode, "accent");
  const colorBgContainer = readThemeToken("--table-container-bg", mode, "card");
  const colorBgLayout = readThemeToken("--background", mode, "background");
  const colorText = readThemeToken("--foreground", mode, "foreground");
  const colorBorder = readThemeToken("--table-container-border", mode, "border");
  const colorTextSecondary = readThemeToken("--text-secondary", mode, "mutedForeground");
  const colorTextSubtle = readThemeToken("--text-subtle", mode, "mutedForeground");
  const colorFillSecondary = readThemeToken("--table-row-hover", mode, "muted");
  const brandText = readThemeToken("--brand-text", mode, "accent");
  const borderRadius = defaults.radius;

  return {
    /** Single scope — algorithm swap on ConfigProvider remount refreshes all ant tokens. */
    cssVar: { key: "app" },
    algorithm: mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      fontFamily: "inherit",
      colorPrimary,
      colorBgContainer,
      colorBgLayout,
      colorText,
      colorBorder,
      colorTextPlaceholder: colorTextSubtle,
      colorFillSecondary: colorFillSecondary,
      colorFillTertiary: colorFillSecondary,
      colorFillAlter: colorFillSecondary,
      borderRadius,
      controlHeight: 40,
    },
    components: {
      Button: { controlHeight: 40, borderRadius },
      Input: { controlHeight: 40, borderRadius },
      Select: {
        controlHeight: 40,
        borderRadius,
        colorBgContainer,
        colorBorder,
        colorText,
        colorTextQuaternary: colorTextSubtle,
        optionSelectedBg: colorFillSecondary,
        optionActiveBg: colorFillSecondary,
        selectorBg: colorBgContainer,
      },
      InputNumber: { controlHeight: 40, borderRadius },
      DatePicker: { controlHeight: 40, borderRadius },
      Pagination: {
        itemBg: colorBgContainer,
        itemActiveBg: colorBgContainer,
        itemActiveColor: brandText,
        itemActiveColorDisabled: colorTextSubtle,
        colorBgContainer,
        colorBorder,
        colorPrimary: brandText,
      },
      Radio: {
        buttonBg: colorBgContainer,
        buttonColor: colorTextSecondary,
        buttonCheckedBg: colorFillSecondary,
        buttonSolidCheckedBg: colorPrimary,
        buttonSolidCheckedColor: readThemeToken("--accent-foreground", mode, "accent"),
        colorBorder,
      },
      Calendar: {
        fullBg: colorBgContainer,
        fullPanelBg: colorBgContainer,
        itemActiveBg: colorPrimary,
        colorBgContainer,
        colorText,
        colorTextHeading: colorText,
        colorBorder: readThemeToken("--table-row-border", mode, "border"),
      },
      Popover: {
        colorBgElevated: readThemeToken("--popover", mode, "card"),
        colorText: readThemeToken("--popover-foreground", mode, "foreground"),
      },
      Table: {
        headerBg: readThemeToken("--table-head-bg", mode, "muted"),
        headerColor: readThemeToken("--table-head-fg", mode, "mutedForeground"),
        rowHoverBg: colorFillSecondary,
        borderColor: readThemeToken("--table-row-border", mode, "border"),
        footerBg: readThemeToken("--table-summary-bg", mode, "muted"),
        headerSortActiveBg: readThemeToken("--table-head-bg", mode, "muted"),
        bodySortBg: colorFillSecondary,
        rowExpandedBg: readThemeToken("--table-summary-bg", mode, "muted"),
      },
      Steps: {
        colorPrimary,
        colorText,
        colorTextDescription: colorTextSecondary,
        colorSplit: readThemeToken("--table-row-border", mode, "border"),
        colorFillContent: colorFillSecondary,
        controlHeight: 24,
        fontSize: 12,
        titleLineHeight: 1.4,
      },
      Avatar: {
        colorTextLightSolid: readThemeToken("--hub-hr-fg", mode, "accent"),
        colorTextPlaceholder: colorTextSubtle,
      },
    },
  };
}
