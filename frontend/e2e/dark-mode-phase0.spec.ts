import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  type AuditIssue,
  audit,
  enableDarkMode,
  expectDarkRoot,
  logIssues,
  login,
} from "./helpers/dark-audit";

const adminEmail = process.env.E2E_EMAIL ?? "admin@qafacafe.com";
const adminPassword = process.env.E2E_PASSWORD ?? "password123";
const staffEmail = process.env.E2E_STAFF_EMAIL ?? "staff.siam@qafacafe.com";

const issues: AuditIssue[] = [];
const reportDir = join(__dirname, "reports");

test.describe("dark mode spot-check — Phase 0", () => {
  test.beforeAll(() => {
    mkdirSync(reportDir, { recursive: true });
  });

  test.afterAll(() => {
    writeFileSync(
      join(reportDir, "dark-mode-phase0.json"),
      JSON.stringify({ generatedAt: new Date().toISOString(), issues }, null, 2),
    );
    logIssues("Phase 0", issues);
  });

  test("0.1 Login — auth hero + form in dark mode", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await enableDarkMode(page);
    await page.goto("/login");
    await expectDarkRoot(page);

    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /enterprise grade efficiency/i })).toBeVisible();
    await expect(page.getByText(/QafaCafe streamlines your operations/)).toBeVisible();
    await expect(page.getByText("99.9%")).toBeVisible();

    const bg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--background").trim(),
    );
    expect(bg).toBe("#1a1814");

    await audit(issues, page, "0.1 Login", "/login", "Hero title", page.getByRole("heading", { name: /enterprise grade efficiency/i }));
    await audit(issues, page, "0.1 Login", "/login", "Hero body", page.getByText(/QafaCafe streamlines your operations/));
    await audit(issues, page, "0.1 Login", "/login", "Hero stat value", page.getByText("99.9%"));
    await audit(issues, page, "0.1 Login", "/login", "Hero stat label", page.getByText("Uptime"));
    await audit(issues, page, "0.1 Login", "/login", "Form heading", page.getByRole("heading", { name: /welcome back/i }));
    await audit(issues, page, "0.1 Login", "/login", "Form subtitle", page.getByText(/sign in to your enterprise/i));
    await audit(issues, page, "0.1 Login", "/login", "Sign in button", page.getByRole("button", { name: /sign in/i }));
    await audit(issues, page, "0.1 Login", "/login", "Demo account row", page.getByRole("button", { name: /admin:/i }));

    await page.screenshot({ path: join(reportDir, "phase0-01-login.png"), fullPage: true });
  });

  test("0.2–0.4 Shell — sidebar, topbar, hub tabs (admin)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await enableDarkMode(page);
    await login(page, adminEmail, adminPassword);

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const sidebar = page.locator('aside[aria-label="Application sidebar"]');
    await expect(sidebar).toBeVisible();

    await audit(
      issues,
      page,
      "0.2 Sidebar",
      "/",
      "Brand title",
      sidebar.getByText("QafaCafe", { exact: true }),
    );
    await audit(
      issues,
      page,
      "0.2 Sidebar",
      "/",
      "Active nav link",
      sidebar.locator('nav[aria-label="Primary navigation"] a[aria-current="page"]'),
    );
    await audit(
      issues,
      page,
      "0.2 Sidebar",
      "/",
      "Inactive nav link",
      sidebar.locator('nav[aria-label="Primary navigation"] a:not([aria-current="page"])').first(),
    );

    const branchPicker = sidebar.getByLabel("Select branch");
    if (await branchPicker.isVisible()) {
      await audit(issues, page, "0.3 Topbar", "/", "Sidebar branch picker", branchPicker);
    }

    await audit(issues, page, "0.3 Topbar", "/", "Account menu", page.getByRole("button", { name: /^account menu/i }));

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/inventory");
    await page.waitForLoadState("networkidle");

    const hubTabs = page.locator('nav[aria-label*="sections"] a');
    const activeTab = hubTabs.and(page.locator('[aria-current="page"]'));

    if (await activeTab.count()) {
      await audit(issues, page, "0.4 Hub tabs", "/inventory (mobile)", "Active hub tab", activeTab.first());
    } else {
      issues.push({
        phase: "0.4 Hub tabs",
        route: "/inventory (mobile)",
        label: "Active hub tab",
        severity: "P1",
        detail: "no active inventory tab found in mobile viewport",
      });
    }

    const inactiveTab = hubTabs.filter({ hasNot: page.locator('[aria-current="page"]') }).first();
    if (await inactiveTab.count()) {
      await audit(issues, page, "0.4 Hub tabs", "/inventory (mobile)", "Inactive hub tab", inactiveTab);
    }

    const inventoryIconToken = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--tone-inventory-fg").trim(),
    );
    if (!inventoryIconToken || inventoryIconToken.includes("black")) {
      issues.push({
        phase: "0.4 Hub tabs",
        route: "/inventory (mobile)",
        label: "Inventory icon token",
        severity: "P1",
        detail: `--tone-inventory-fg unresolved or light-mode (${inventoryIconToken || "empty"})`,
      });
    }

    await page.screenshot({ path: join(reportDir, "phase0-02-dashboard.png"), fullPage: true });
    await page.screenshot({ path: join(reportDir, "phase0-04-inventory-tabs.png"), fullPage: true });
  });

  test("0.3 Branch picker — All Branches vs single branch", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await enableDarkMode(page);
    await login(page, adminEmail, adminPassword);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const branchPicker = page
      .locator('aside[aria-label="Application sidebar"]')
      .getByLabel("Select branch");
    if (!(await branchPicker.isVisible())) {
      issues.push({
        phase: "0.3 Topbar",
        route: "/",
        label: "Branch picker states",
        severity: "P2",
        detail: "branch picker not visible for super admin — skipped HQ/single branch comparison",
      });
      return;
    }

    await branchPicker.click();
    await page.getByRole("option", { name: /all branches/i }).click();
    await page.waitForTimeout(500);
    await audit(
      issues,
      page,
      "0.3 Topbar",
      "/ (All Branches)",
      "Page title in HQ scope",
      page.getByRole("heading").first(),
    );

    await branchPicker.click();
    const branchOptions = page.getByRole("option").filter({ hasNotText: /all branches/i });
    if (await branchOptions.count()) {
      await branchOptions.first().click();
      await page.waitForTimeout(500);
      await audit(
        issues,
        page,
        "0.3 Topbar",
        "/ (single branch)",
        "Page title in branch scope",
        page.getByRole("heading").first(),
      );
    }
  });

  test("0.5 Access denied — staff on finance hub", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await enableDarkMode(page);
    await login(page, staffEmail, adminPassword);
    await page.goto("/finance/overview");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Access denied")).toBeVisible({ timeout: 15_000 });

    await audit(issues, page, "0.5 Access denied", "/finance/overview", "Denied title", page.getByText("Access denied", { exact: true }));
    await audit(
      issues,
      page,
      "0.5 Access denied",
      "/finance/overview",
      "Denied description",
      page.getByText(/don't have permission|permission to view/i),
    );
    await audit(
      issues,
      page,
      "0.5 Access denied",
      "/finance/overview",
      "Back link",
      page.getByRole("link", { name: /back to dashboard/i }),
    );

    await page.screenshot({ path: join(reportDir, "phase0-05-access-denied.png"), fullPage: true });
  });
});
