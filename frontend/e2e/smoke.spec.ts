import { test, expect } from "@playwright/test";
import { locators } from "./helpers";

test.describe("public routes", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(locators.loginHeading(page)).toBeVisible();
  });
});
