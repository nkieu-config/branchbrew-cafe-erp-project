import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

const IMPACT_LEVELS = new Set(["critical", "serious"]);

export async function expectNoSeriousViolations(page: Page, context?: string) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

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
