import { test, expect } from "@playwright/test";
import { expectPosTerminalReady, locators } from "./helpers";

test.describe("authenticated routes", () => {
  test("manager can open POS terminal", async ({ page }) => {
    await page.goto("/pos/terminal");
    await expectPosTerminalReady(page);
  });

  test("manager can open inventory balance", async ({ page }) => {
    await page.goto("/inventory");
    await expect(locators.inventorySearch(page)).toBeVisible({
      timeout: 15_000,
    });
  });

  test("legacy /users redirects to organization users", async ({ page }) => {
    await page.goto("/users");
    await expect(page).toHaveURL(/\/organization\/users/);
  });
});
