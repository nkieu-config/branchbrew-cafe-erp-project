import { test, expect } from "@playwright/test";
import { demoManagerButton } from "./helpers";

test.describe("finance business flow", () => {
  test("manager demo login opens finance overview via sidebar", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Demo accounts")).toBeVisible();
    await demoManagerButton(page).click();
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30_000 });

    await page.getByRole("link", { name: "Finance", exact: true }).click();
    await expect(page).toHaveURL(/\/finance\/overview/);

    await expect(page.getByRole("heading", { name: /^settlements$/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /export sales/i })).toBeVisible();
    await expect(page.getByPlaceholder(/search expenses/i)).toBeVisible();
  });
});
