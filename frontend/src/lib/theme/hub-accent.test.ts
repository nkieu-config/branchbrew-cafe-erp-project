import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { hubAccentIconClass, hubCardIconClass } from "./hub-accent";

describe("hub accent icons", () => {
  it("uses readable -icon Tailwind bridge classes, not CTA fill tokens", () => {
    expect(hubCardIconClass("procurement")).toBe("w-5 h-5 text-hub-procurement-icon");
    expect(hubAccentIconClass("kitchen")).toContain("text-hub-kitchen-icon");
    expect(hubCardIconClass()).toContain("text-hub-products-icon");
  });

  it("defines hub -icon tokens and KDS on-time success semantics in tokens.css", () => {
    const tokensPath = join(import.meta.dirname, "../../styles/theme/tokens.css");
    const tokens = readFileSync(tokensPath, "utf8");
    expect(tokens).toMatch(/--hub-procurement-icon:\s*var\(--tone-procurement-fg\)/);
    expect(tokens).toMatch(/--hub-kitchen-icon:\s*var\(--tone-kitchen-fg\)/);
    expect(tokens).toMatch(/--kds-on-time-border:\s*var\(--semantic-success\)/);
    expect(tokens).toMatch(/--state-empty-icon:\s*var\(--text-subtle\)/);
    expect(tokens).toMatch(/--widget-alerts-empty-icon:\s*var\(--state-healthy-icon\)/);
    expect(tokens).toMatch(/--kds-empty-icon:\s*var\(--text-subtle\)/);
  });

  it("uses neutral expiry panel header with dedicated icon accent", () => {
    const tokensPath = join(import.meta.dirname, "../../styles/theme/tokens.css");
    const tokens = readFileSync(tokensPath, "utf8");
    expect(tokens).toMatch(/--expiry-panel-header-bg:\s*var\(--table-head-bg\)/);
    expect(tokens).toMatch(/--expiry-panel-header-icon:\s*var\(--status-danger-fg\)/);
    expect(tokens).not.toMatch(/--expiry-panel-header-bg:\s*var\(--status-danger-bg\)/);
  });

  it("overrides hub -icon and KDS on-time tokens in dark mode", () => {
    const tokensPath = join(import.meta.dirname, "../../styles/theme/tokens.css");
    const tokens = readFileSync(tokensPath, "utf8");
    const darkSection = tokens.slice(tokens.indexOf(".dark {"));
    expect(darkSection).toMatch(/--hub-procurement-icon:\s*var\(--tone-procurement-fg\)/);
    expect(darkSection).toMatch(
      /--kds-on-time-header:\s*color-mix\(in oklch, var\(--semantic-success\) 55%, var\(--card\)\)/,
    );
  });
});
