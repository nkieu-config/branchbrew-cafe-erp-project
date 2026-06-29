import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  type AuditIssue,
  audit,
  auditCssToken,
  enableDarkMode,
  logIssues,
  login,
  prepareDarkAdminSession,
  selectCentralKitchenBranch,
  switchToCentralKitchenViaKitchenPage,
} from "./helpers/dark-audit";

const adminEmail = process.env.E2E_EMAIL ?? "admin@qafacafe.com";
const adminPassword = process.env.E2E_PASSWORD ?? "password123";

const issues: AuditIssue[] = [];
const reportDir = join(__dirname, "reports");

test.describe("dark mode spot-check — Phase 3", () => {
  test.beforeAll(() => {
    mkdirSync(reportDir, { recursive: true });
  });

  test.afterAll(() => {
    writeFileSync(
      join(reportDir, "dark-mode-phase3.json"),
      JSON.stringify({ generatedAt: new Date().toISOString(), issues }, null, 2),
    );
    logIssues("Phase 3", issues);
  });

  test("3.1 Products — menu hub + food cost tones", async ({ page }) => {
    await prepareDarkAdminSession(page, adminEmail, adminPassword);

    await page.goto("/products");
    await page.waitForLoadState("networkidle");
    await audit(
      issues,
      page,
      "3.1 Products",
      "/products",
      "Page heading",
      page.getByRole("heading").first(),
    );
    await auditCssToken(
      issues,
      page,
      "3.1 Products",
      "/products",
      "Products hub icon token",
      "--hub-products-icon",
      /black/,
    );
    await page.screenshot({ path: join(reportDir, "phase3-01-products.png"), fullPage: true });

    await page.goto("/products/costing");
    await page.waitForLoadState("networkidle");
    await audit(
      issues,
      page,
      "3.1 Products",
      "/products/costing",
      "Costing heading",
      page.getByRole("heading").first(),
    );
    const foodCostCell = page.locator("td, span").filter({ hasText: /^\d+\.\d%$/ }).first();
    if (await foodCostCell.count()) {
      await audit(issues, page, "3.1 Products", "/products/costing", "Food cost %", foodCostCell);
    }
    await page.screenshot({ path: join(reportDir, "phase3-02-costing.png"), fullPage: true });

    await page.goto("/products/ingredients");
    await page.waitForLoadState("networkidle");
    await audit(
      issues,
      page,
      "3.1 Products",
      "/products/ingredients",
      "Ingredients heading",
      page.getByRole("heading").first(),
    );
    await page.screenshot({ path: join(reportDir, "phase3-03-ingredients.png"), fullPage: true });
  });

  test("3.2 Kitchen — central kitchen kanban + BOM", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await enableDarkMode(page);
    await login(page, adminEmail, adminPassword);

    const switched =
      (await selectCentralKitchenBranch(page)) ||
      (await switchToCentralKitchenViaKitchenPage(page));
    expect(switched, "Qafa Central Kitchen branch must exist in seed").toBe(true);

    if (!page.url().includes("/kitchen")) {
      await page.goto("/kitchen");
    }
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("button", { name: /new order/i })).toBeVisible();
    await expect(page.getByText(/not a central kitchen/i)).not.toBeVisible();

    await audit(
      issues,
      page,
      "3.2 Kitchen",
      "/kitchen",
      "Kitchen heading",
      page.getByRole("heading").first(),
    );
    await auditCssToken(
      issues,
      page,
      "3.2 Kitchen",
      "/kitchen",
      "Kitchen hub icon token",
      "--hub-kitchen-icon",
      /black/,
    );
    await audit(
      issues,
      page,
      "3.2 Kitchen",
      "/kitchen",
      "Order count summary",
      page.getByText(/\d+ production orders?/),
    );
    await audit(
      issues,
      page,
      "3.2 Kitchen",
      "/kitchen",
      "New order CTA",
      page.getByRole("button", { name: /new order/i }),
    );

    for (const [label, text] of [
      ["Planned column header", "Planned"],
      ["In Progress column header", "In Progress"],
      ["Completed column header", "Completed"],
    ] as const) {
      await audit(
        issues,
        page,
        "3.2 Kitchen",
        "/kitchen",
        label,
        page.getByText(text, { exact: true }),
      );
    }

    await audit(
      issues,
      page,
      "3.2 Kitchen",
      "/kitchen",
      "Planned order badge",
      page.getByText("PRD-DEMO-001"),
    );
    await audit(
      issues,
      page,
      "3.2 Kitchen",
      "/kitchen",
      "Planned card title",
      page.getByText("House Cold Brew Base").first(),
    );
    await audit(
      issues,
      page,
      "3.2 Kitchen",
      "/kitchen",
      "In-progress order badge",
      page.getByText("PRD-DEMO-002"),
    );

    const emptyCompleted = page.getByText(/completed batches appear here/i);
    if (await emptyCompleted.isVisible()) {
      await audit(issues, page, "3.2 Kitchen", "/kitchen", "Completed column empty hint", emptyCompleted);
    }

    await page.screenshot({ path: join(reportDir, "phase3-04-kitchen-kanban.png"), fullPage: true });

    await page.goto("/kitchen/boms");
    await page.waitForLoadState("networkidle");
    await audit(
      issues,
      page,
      "3.2 Kitchen",
      "/kitchen/boms",
      "BOM heading",
      page.getByRole("heading").first(),
    );
    await page.screenshot({ path: join(reportDir, "phase3-05-boms.png"), fullPage: true });
  });

  test("3.3 CRM — customers + promotions", async ({ page }) => {
    await prepareDarkAdminSession(page, adminEmail, adminPassword);

    await page.goto("/crm/customers");
    await page.waitForLoadState("networkidle");
    await audit(
      issues,
      page,
      "3.3 CRM",
      "/crm/customers",
      "Customers heading",
      page.getByRole("heading").first(),
    );
    await auditCssToken(
      issues,
      page,
      "3.3 CRM",
      "/crm/customers",
      "CRM hub icon token",
      "--hub-crm-icon",
      /black/,
    );
    await page.screenshot({ path: join(reportDir, "phase3-06-customers.png"), fullPage: true });

    await page.goto("/crm/promotions");
    await page.waitForLoadState("networkidle");
    await audit(
      issues,
      page,
      "3.3 CRM",
      "/crm/promotions",
      "Promotions heading",
      page.getByRole("heading").first(),
    );

    const statusBadge = page.locator(".ant-table-tbody").getByText(/active|draft|expired/i).first();
    if (await statusBadge.count()) {
      await audit(issues, page, "3.3 CRM", "/crm/promotions", "Campaign status badge", statusBadge);
    }

    await page.screenshot({ path: join(reportDir, "phase3-07-promotions.png"), fullPage: true });
  });
});
