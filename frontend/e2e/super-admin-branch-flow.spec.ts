import { test, expect, type Page } from "@playwright/test";

const ACTIVE_BRANCH_STORAGE_KEY = "branchbrew_active_branch_id";

async function selectBranchOption(page: Page, optionName: RegExp | string) {
  await page.getByRole("combobox", { name: "Select branch" }).first().click();
  await page.getByRole("option", { name: optionName }).click();
}

async function chooseAllBranches(page: Page) {
  await selectBranchOption(page, /all branches/i);
}

test.describe("super admin branch flow", () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("combobox", { name: "Select branch" }).first()).toBeVisible({
      timeout: 30_000,
    });
  });

  test("all-branches mode shows empty state on inventory then loads after branch pick", async ({
    page,
  }) => {
    await chooseAllBranches(page);

    await page.goto("/inventory");
    await expect(page.getByTestId("branch-empty-state")).toBeVisible();
    await expect(
      page.getByTestId("branch-empty-state").getByText("Select a branch", { exact: true }),
    ).toBeVisible();

    await selectBranchOption(page, /downtown/i);

    await expect(page.getByPlaceholder(/search ingredients/i)).toBeVisible({
      timeout: 15_000,
    });
  });

  test("dashboard stays usable in all-branches mode", async ({ page }) => {
    await chooseAllBranches(page);

    await page.goto("/");
    await expect(page.getByText(/today's sales/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /reset dashboard widget layout/i })).toBeVisible();
  });

  test("branch selection persists across navigation", async ({ page }) => {
    await selectBranchOption(page, /downtown/i);

    await page.goto("/inventory");
    await expect(page.getByPlaceholder(/search ingredients/i)).toBeVisible({
      timeout: 15_000,
    });

    await page.goto("/hr/employees");
    await expect(page.getByPlaceholder(/search name, email, role/i)).toBeVisible({
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
    await expect(page.getByPlaceholder(/search groups and options/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole("button", { name: /new group/i })).toBeVisible();
  });
});
