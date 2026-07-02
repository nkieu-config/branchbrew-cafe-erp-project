import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

const IMPACT_LEVELS = new Set(["critical", "serious"]);

type A11yScanOptions = {
  /** Limit analysis to a subtree (e.g. login form panel). */
  include?: string;
  /** Exclude decorative or out-of-scope regions. */
  exclude?: string;
  /**
   * Disable specific axe rules for smoke coverage without changing product UI.
   * Use sparingly and document why in the calling spec.
   */
  disableRules?: string[];
};

export async function expectNoSeriousViolations(
  page: Page,
  context?: string,
  options?: A11yScanOptions,
) {
  let builder = new AxeBuilder({ page }).withTags([
    "wcag2a",
    "wcag2aa",
    "wcag21a",
    "wcag21aa",
  ]);

  if (options?.include) {
    builder = builder.include(options.include);
  }

  if (options?.exclude) {
    builder = builder.exclude(options.exclude);
  }

  if (options?.disableRules?.length) {
    builder = builder.disableRules(options.disableRules);
  }

  const results = await builder.analyze();

  const violations = results.violations.filter((violation) =>
    IMPACT_LEVELS.has(violation.impact ?? ""),
  );

  if (violations.length > 0) {
    const summary = violations
      .map(
        (violation) =>
          `[${violation.impact}] ${violation.id}: ${violation.description} (${violation.nodes.length} nodes)`,
      )
      .join("\n");
    throw new Error(context ? `${context}\n${summary}` : summary);
  }

  expect(violations).toEqual([]);
}
