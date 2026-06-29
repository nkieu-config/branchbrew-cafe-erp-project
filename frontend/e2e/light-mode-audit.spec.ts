import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  type AuditIssue,
  audit,
  auditCssToken,
  auditNoDarkLeak,
  auditPageBackground,
  enableLightMode,
  hoverBackgroundChanged,
  hubIconForbidden,
  logIssues,
  selectCentralKitchenBranch,
  switchToCentralKitchenViaKitchenPage,
} from "./helpers/theme-audit";

const adminEmail = process.env.E2E_EMAIL ?? "admin@qafacafe.com";
const adminPassword = process.env.E2E_PASSWORD ?? "password123";
const staffEmail = process.env.E2E_STAFF_EMAIL ?? "staff.siam@qafacafe.com";

const issues: AuditIssue[] = [];
const reportDir = join(__dirname, "reports");
const shot = (name: string) => join(reportDir, `light-${name}`);

test.describe.configure({ mode: "serial", timeout: 60_000 });

test.describe("light mode spot-check — all phases", () => {
  test.beforeAll(() => {
    mkdirSync(reportDir, { recursive: true });
  });

  test.beforeEach(async ({ page }) => {
    await enableLightMode(page);
  });

  test.afterAll(() => {
    writeFileSync(
      join(reportDir, "light-mode-audit.json"),
      JSON.stringify({ generatedAt: new Date().toISOString(), issues }, null, 2),
    );
    logIssues("Light audit", issues, "light");
  });

  test("0.2 Shell — sidebar + hub tabs", async ({ page }) => {
    await enableLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await auditPageBackground(issues, page, "0.2 Shell", "/", "light");

    const sidebar = page.locator('aside[aria-label="Application sidebar"]');
    await audit(issues, page, "0.2 Shell", "/", "Brand title", sidebar.getByText("QafaCafe", { exact: true }));
    await audit(issues, page, "0.2 Shell", "/", "Inactive nav link", sidebar.locator('nav a:not([aria-current="page"])').first());

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/inventory");
    await page.waitForLoadState("networkidle");
    await auditNoDarkLeak(issues, page, "0.2 Shell", "/inventory", "--table-container-bg", "Table container bg");

    await page.screenshot({ path: shot("phase0-02-dashboard.png"), fullPage: true });
  });

  test("1.1 Dashboard — widgets + alerts", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Today's Sales")).toBeVisible({ timeout: 20_000 });

    await audit(issues, page, "1.1 Dashboard", "/", "Sales widget label", page.getByText("Today's Sales"));
    await audit(issues, page, "1.1 Dashboard", "/", "Alerts header", page.getByText("Inventory Alerts"));

    const healthyEmpty = page.getByText("Stock and expiry levels look healthy");
    if (await healthyEmpty.isVisible()) {
      await audit(issues, page, "1.1 Dashboard", "/", "Alerts empty text", healthyEmpty);
    }

    await auditNoDarkLeak(issues, page, "1.1 Dashboard", "/", "--widget-alerts-header", "Alerts header token");
    await page.screenshot({ path: shot("phase1-01-dashboard.png"), fullPage: true });
  });

  test("1.2 KDS — connection + empty/tickets", async ({ page }) => {
    await page.goto("/kds");
    await page.waitForLoadState("networkidle");

    await auditCssToken(issues, page, "1.2 KDS", "/kds", "On-time header token", "--kds-on-time-header");
    const connectionBadge = page.getByText(/live sync|offline/i).first();
    if (await connectionBadge.isVisible()) {
      await audit(issues, page, "1.2 KDS", "/kds", "Connection badge", connectionBadge);
    }
    await page.screenshot({ path: shot("phase1-02-kds.png"), fullPage: true });
  });

  test.skip("1.3 POS Terminal — cart + summary (staff)", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
    await enableLightMode(page);
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.locator("#email").waitFor({ state: "visible", timeout: 15_000 });
    await page.locator("#email").fill(staffEmail);
    await page.locator("#password").fill(adminPassword);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30_000 });
    await page.goto("/pos/terminal");
    await page.waitForLoadState("networkidle");

    await audit(issues, page, "1.3 POS", "/pos/terminal", "Cart empty label", page.getByText("Cart is empty"));
    await auditNoDarkLeak(issues, page, "1.3 POS", "/pos/terminal", "--pos-summary-bg", "Summary panel bg");

    const row = page.locator(".ant-table-tbody tr").first();
    if (await row.count()) {
      await hoverBackgroundChanged(page, row);
    }

    await page.screenshot({ path: shot("phase1-03-pos-terminal.png"), fullPage: true });
    await context.close();
  });

  test("1.4 POS Orders + Settlement", async ({ page }) => {

    await page.goto("/pos/orders");
    await page.waitForLoadState("networkidle");
    await audit(issues, page, "1.4 POS", "/pos/orders", "Page heading", page.getByRole("heading").first());

    const row = page.locator(".ant-table-tbody tr.ant-table-row").first();
    if (await row.count()) {
      const hoverBg = await row.evaluate((el) => {
        el.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
        return getComputedStyle(el.querySelector("td") ?? el).backgroundColor;
      });
      const probe = await page.evaluate((bg) => {
        const span = document.createElement("span");
        span.style.color = bg;
        document.body.appendChild(span);
        const rgb = getComputedStyle(span).color.match(/(\d+)/g)?.map(Number) ?? [];
        span.remove();
        return rgb;
      }, hoverBg);
      if (probe.length >= 3) {
        const [r, g, b] = probe;
        if (b > r + 15 && b > g + 10) {
          issues.push({
            phase: "1.4 POS",
            route: "/pos/orders",
            label: "Table row hover",
            severity: "P1",
            detail: `hover purple-leaning rgb(${r}, ${g}, ${b})`,
          });
        }
      }
    }

    await page.goto("/pos/settlement");
    await page.waitForLoadState("networkidle");
    await audit(issues, page, "1.4 POS", "/pos/settlement", "Page heading", page.getByRole("heading").first());
    await page.screenshot({ path: shot("phase1-04-pos-orders.png"), fullPage: true });
  });

  test("2.1 Inventory batches — expiry heatmap", async ({ page }) => {
    await page.goto("/inventory/batches");
    await page.waitForLoadState("networkidle");

    await auditCssToken(issues, page, "2.1 Batches", "/inventory/batches", "Expiry header bg", "--expiry-panel-header-bg");
    const heatmapTitle = page.getByText(/expiry heatmap|batch expiry/i).first();
    if (await heatmapTitle.isVisible()) {
      await audit(issues, page, "2.1 Batches", "/inventory/batches", "Heatmap title", heatmapTitle);
    }
    await page.screenshot({ path: shot("phase2-01-batches.png"), fullPage: true });
  });

  test("2.2 HR payroll", async ({ page }) => {
    await page.goto("/hr/payroll");
    await page.waitForLoadState("networkidle");
    await audit(issues, page, "2.2 Payroll", "/hr/payroll", "Page heading", page.getByRole("heading").first());
    await page.screenshot({ path: shot("phase2-02-payroll.png"), fullPage: true });
  });

  test("2.3 Finance ledger", async ({ page }) => {
    await page.goto("/finance/ledger");
    await page.waitForLoadState("networkidle");
    await audit(issues, page, "2.3 Ledger", "/finance/ledger", "Page heading", page.getByRole("heading").first());
    await auditCssToken(issues, page, "2.3 Ledger", "/finance/ledger", "Debit fg", "--ledger-debit-fg");
    await page.screenshot({ path: shot("phase2-03-ledger.png"), fullPage: true });
  });

  test("3.1 Products hub", async ({ page }) => {
    await page.goto("/products");
    await page.waitForLoadState("networkidle");
    await audit(issues, page, "3.1 Products", "/products", "Page heading", page.getByRole("heading").first());
    await auditCssToken(
      issues,
      page,
      "3.1 Products",
      "/products",
      "Products hub icon",
      "--hub-products-icon",
      hubIconForbidden("light"),
    );
    await page.screenshot({ path: shot("phase3-01-products.png"), fullPage: true });
  });

  test("3.2 Kitchen kanban + BOM", async ({ page }) => {
    await page.goto("/kitchen");
    await page.waitForLoadState("networkidle");

    const switched =
      (await selectCentralKitchenBranch(page)) ||
      (await switchToCentralKitchenViaKitchenPage(page));
    expect(switched).toBe(true);

    if (!page.url().includes("/kitchen")) await page.goto("/kitchen");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("button", { name: /new order/i })).toBeVisible();
    await audit(issues, page, "3.2 Kitchen", "/kitchen", "Order count", page.getByText(/\d+ production orders?/));
    await audit(issues, page, "3.2 Kitchen", "/kitchen", "Planned badge", page.getByText("PRD-DEMO-001"));

    await page.goto("/kitchen/boms");
    await page.waitForLoadState("networkidle");
    await audit(issues, page, "3.2 Kitchen", "/kitchen/boms", "BOM heading", page.getByRole("heading").first());
    await page.screenshot({ path: shot("phase3-kitchen.png"), fullPage: true });
  });

  test("3.3 CRM", async ({ page }) => {
    await page.goto("/crm/customers");
    await page.waitForLoadState("networkidle");
    await audit(issues, page, "3.3 CRM", "/crm/customers", "Customers heading", page.getByRole("heading").first());

    await page.goto("/crm/promotions");
    await page.waitForLoadState("networkidle");
    await audit(issues, page, "3.3 CRM", "/crm/promotions", "Promotions heading", page.getByRole("heading").first());
    await page.screenshot({ path: shot("phase3-crm.png"), fullPage: true });
  });

  test("4.1 Assets", async ({ page }) => {
    await page.goto("/assets");
    await page.waitForLoadState("networkidle");
    await audit(issues, page, "4.1 Assets", "/assets", "Page heading", page.getByRole("heading").first());
    const emptyHint = page.getByText(/no equipment|register your first asset/i).first();
    if (await emptyHint.isVisible()) {
      await audit(issues, page, "4.1 Assets", "/assets", "Empty state", emptyHint);
    }
    await page.screenshot({ path: shot("phase4-01-assets.png"), fullPage: true });
  });

  test("4.2 Organization", async ({ page }) => {
    await page.goto("/organization/branches");
    await page.waitForLoadState("networkidle");
    await audit(issues, page, "4.2 Org", "/organization/branches", "Branches heading", page.getByRole("heading").first());

    await page.goto("/organization/users");
    await page.waitForLoadState("networkidle");
    await audit(issues, page, "4.2 Org", "/organization/users", "Users heading", page.getByRole("heading").first());
    await page.screenshot({ path: shot("phase4-02-org.png"), fullPage: true });
  });

  test("4.3 Settings + audit", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");
    await audit(issues, page, "4.3 Settings", "/settings", "Settings heading", page.getByRole("heading").first());
    await audit(issues, page, "4.3 Settings", "/settings", "Company section", page.getByText("Company information", { exact: true }));

    await page.goto("/settings/audit");
    await page.waitForLoadState("networkidle");
    await audit(issues, page, "4.3 Settings", "/settings/audit", "Audit heading", page.getByRole("heading").first());
    await page.screenshot({ path: shot("phase4-03-settings.png"), fullPage: true });
  });
});
