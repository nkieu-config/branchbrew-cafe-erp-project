import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { dashboardAlertsRowClass } from "./dashboard";

function darkTokensSection(): string {
  const tokensPath = join(import.meta.dirname, "../../styles/theme/tokens.css");
  const tokens = readFileSync(tokensPath, "utf8");
  return tokens.slice(tokens.indexOf(".dark {"));
}

describe("dark mode tokens", () => {
  it("redefines light-only black mixes for hub icon fg", () => {
    const dark = darkTokensSection();
    expect(dark).toMatch(/--tone-inventory-fg:\s*color-mix/);
    expect(dark).toMatch(/--tone-pos-fg:\s*color-mix/);
    expect(dark).not.toMatch(/--tone-inventory-fg:\s*color-mix\(in oklch, var\(--hub-inventory\) 82%, black\)/);
  });

  it("mutes remaining hub CTA fills and aligns fg to foreground", () => {
    const dark = darkTokensSection();
    expect(dark).toMatch(/--hub-finance:\s*color-mix/);
    expect(dark).toMatch(/--hub-assets:\s*color-mix/);
    expect(dark).toMatch(/--hub-settings:\s*color-mix/);
    expect(dark).toMatch(/--hub-finance-fg:\s*var\(--foreground\)/);
  });

  it("redefines status-soft surfaces for badges and metric icon wraps", () => {
    const dark = darkTokensSection();
    expect(dark).toMatch(/--tone-success-soft:\s*color-mix/);
    expect(dark).toMatch(/--tone-danger-soft:\s*color-mix/);
    expect(dark).toMatch(/--tone-blue-soft:\s*color-mix/);
  });

  it("uses token-based alert row hover instead of brightness hacks", () => {
    const tokensPath = join(import.meta.dirname, "../../styles/theme/tokens.css");
    const tokens = readFileSync(tokensPath, "utf8");
    expect(tokens).toMatch(/--widget-alerts-low-row-hover:/);
    expect(dashboardAlertsRowClass("low")).toContain("--widget-alerts-low-row-hover");
    expect(dashboardAlertsRowClass("expiry")).toContain("--widget-alerts-expiry-row-hover");
  });

  it("brightens success primitive and denied-state icon for dark canvas", () => {
    const globalsPath = join(import.meta.dirname, "../../app/globals.css");
    const globals = readFileSync(globalsPath, "utf8");
    const darkGlobals = globals.slice(globals.indexOf(".dark {"));
    expect(darkGlobals).toMatch(/--success:\s*#2dab7a/);

    const dark = darkTokensSection();
    expect(dark).toMatch(/--state-denied-icon:\s*color-mix/);
    expect(dark).toMatch(/--table-container-bg:\s*color-mix/);
    expect(dark).toMatch(/--expiry-warning-fg:\s*color-mix/);
  });

  it("uses readable alerts header and warm table hover in dark mode", () => {
    const dark = darkTokensSection();
    expect(dark).toMatch(
      /--widget-alerts-header:\s*color-mix\(in oklch, var\(--metric-red\) 40%, var\(--foreground\)\)/,
    );
    expect(dark).toMatch(
      /--table-row-hover:\s*color-mix\(in oklch, var\(--muted\) 48%, var\(--table-body-bg\)\)/,
    );
  });
});
