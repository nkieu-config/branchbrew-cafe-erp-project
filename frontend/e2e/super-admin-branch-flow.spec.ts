import { test, expect } from "@playwright/test";
import {
  locators,
  selectBranchOption,
} from "./helpers";

const ACTIVE_BRANCH_STORAGE_KEY = "branchbrew_active_branch_id";

async function chooseAllBranches(page: Parameters<typeof selectBranchOption>[0]) {
  await selectBranchOption(page, /all branches/i);
}

test.describe("super admin branch flow", () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(locators.branchPicker(page)).toBeVisible({
      timeout: 30_000,
    });
  });

  test("all-branches mode shows empty state on inventory then loads after branch pick", async ({
    page,
  }) => {
    await chooseAllBranches(page);

    await page.goto("/inventory");
    await expect(locators.branchEmptyState(page)).toBeVisible();
    await expect(
      locators.branchEmptyState(page).getByText("Select a branch", { exact: true }),
    ).toBeVisible();

    await selectBranchOption(page, /downtown/i);

    await expect(locators.inventorySearch(page)).toBeVisible({
      timeout: 15_000,
    });
  });

  test("dashboard stays usable in all-branches mode", async ({ page }) => {
    await chooseAllBranches(page);

    await page.goto("/");
    await expect(locators.dashboardSales(page)).toBeVisible();
    await expect(page.getByRole("button", { name: /reset dashboard widget layout/i })).toBeVisible();
  });

  test("branch selection persists across navigation", async ({ page }) => {
    await selectBranchOption(page, /downtown/i);

    await page.goto("/inventory");
    await expect(locators.inventorySearch(page)).toBeVisible({
      timeout: 15_000,
    });

    await page.goto("/hr/employees");
    await expect(locators.employeesSearch(page)).toBeVisible({
      timeout: 15_000,
    });

    const stored = await page.evaluate(
      (key) => localStorage.getItem(key),
      ACTIVE_BRANCH_STORAGE_KEY,
    );
    expect(stored).not.toBe("all");
    expect(stored).toBeTruthy();
  });

  test("modifiers hub list loads for super admin", async ({ page }) => {
    await page.goto("/products/modifiers");
    await expect(locators.modifiersSearch(page)).toBeVisible({
      timeout: 15_000,
    });
    await expect(locators.modifiersNewGroup(page)).toBeVisible();
  });
});
