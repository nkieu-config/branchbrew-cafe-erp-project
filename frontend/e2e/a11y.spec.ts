import { test } from "@playwright/test";
import { expectNoSeriousViolations } from "./a11y-helpers";

test.describe("accessibility smoke", () => {
  test("login page has no serious axe violations", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("heading", { name: /sign in/i }).waitFor();
    await expectNoSeriousViolations(page, "login page");
  });
});

test.describe("authenticated accessibility", () => {
  test.use({ storageState: "e2e/.auth/manager.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/(dashboard)?$/);
  });

  test("POS terminal has no serious axe violations", async ({ page }) => {
    await page.goto("/pos/terminal");
    await page.getByText(/select a branch|product|cart/i).first().waitFor({ timeout: 15_000 });
    await expectNoSeriousViolations(page, "POS terminal");
  });

  test("schedule shift dialog has no serious axe violations", async ({ page }) => {
    await page.goto("/hr/shifts");
    await page.getByRole("button", { name: /schedule shift/i }).first().click();
    await page.getByRole("heading", { name: /schedule shift/i }).waitFor();
    await expectNoSeriousViolations(page, "schedule shift dialog");
  });
});
