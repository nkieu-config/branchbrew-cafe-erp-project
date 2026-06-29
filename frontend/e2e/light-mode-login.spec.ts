import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  type AuditIssue,
  audit,
  auditPageBackground,
  enableLightMode,
  expectLightRoot,
  logIssues,
} from "./helpers/theme-audit";

const issues: AuditIssue[] = [];
const reportDir = join(__dirname, "reports");

test.describe("light mode — login", () => {
  test.beforeAll(() => mkdirSync(reportDir, { recursive: true }));

  test.afterAll(() => {
    writeFileSync(
      join(reportDir, "light-mode-login.json"),
      JSON.stringify({ generatedAt: new Date().toISOString(), issues }, null, 2),
    );
    logIssues("Light login", issues, "light");
  });

  test("login hero + sign-in contrast", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await enableLightMode(page);
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await expectLightRoot(page);

    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible({ timeout: 15_000 });
    await auditPageBackground(issues, page, "Login", "/login", "light");
    await audit(issues, page, "Login", "/login", "Form heading", page.getByRole("heading", { name: /welcome back/i }));
    await audit(issues, page, "Login", "/login", "Sign in button", page.getByRole("button", { name: /sign in/i }));

    await page.screenshot({ path: join(reportDir, "light-phase0-01-login.png"), fullPage: true });
  });
});
