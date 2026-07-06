import { test, expect } from "@playwright/test";
import { locators, expectPosTerminalReady } from "./helpers";

test.describe("POS checkout flow", () => {
  test("cashier adds an item and completes a cash sale", async ({ page }) => {
    await page.goto("/login");
    await expect(locators.loginDemoPanel(page)).toBeVisible();
    await expect(async () => {
      await locators.demoManager(page).click();
      await page.waitForURL((url) => !url.pathname.includes("/login"), {
        timeout: 5_000,
      });
    }).toPass({ timeout: 30_000 });

    await page.goto("/pos/terminal");
    await expectPosTerminalReady(page);

    await page
      .getByRole("button", { name: /^Add Almond Croissant/ })
      .click();

    const cart = locators.posTerminal(page);
    await expect(cart.getByText("Almond Croissant")).toBeVisible();

    await cart.getByRole("button", { name: "Confirm & Pay" }).click();

    const payButton = page.getByRole("button", { name: /^Pay / });
    await expect(payButton).toBeEnabled();
    await payButton.click();

    await expect(
      page.getByRole("heading", { name: "Order completed" }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Ref #\d+/)).toBeVisible();
  });
});
