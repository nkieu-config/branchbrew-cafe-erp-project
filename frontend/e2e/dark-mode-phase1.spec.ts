import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  type AuditIssue,
  audit,
  auditCssToken,
  enableDarkMode,
  expectDarkRoot,
  hoverBackgroundChanged,
  logIssues,
  login,
  prepareDarkAdminSession,
  selectFirstBranch,
} from "./helpers/dark-audit";

const adminEmail = process.env.E2E_EMAIL ?? "admin@qafacafe.com";
const adminPassword = process.env.E2E_PASSWORD ?? "password123";
const staffEmail = process.env.E2E_STAFF_EMAIL ?? "staff.siam@qafacafe.com";

const issues: AuditIssue[] = [];
const reportDir = join(__dirname, "reports");

test.describe("dark mode spot-check — Phase 1", () => {
  test.beforeAll(() => {
    mkdirSync(reportDir, { recursive: true });
  });

  test.afterAll(() => {
    writeFileSync(
      join(reportDir, "dark-mode-phase1.json"),
      JSON.stringify({ generatedAt: new Date().toISOString(), issues }, null, 2),
    );
    logIssues("Phase 1", issues);
  });

  test("1.1 Dashboard — widgets + alerts hover", async ({ page }) => {
    await prepareDarkAdminSession(page, adminEmail, adminPassword);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await audit(issues, page, "1.1 Dashboard", "/", "Sales widget label", page.getByText("Today's Sales"));
    await audit(
      issues,
      page,
      "1.1 Dashboard",
      "/",
      "Sales widget value",
      page.locator(".dashboard-widget").filter({ hasText: "Today's Sales" }).locator("p.tabular-nums").first(),
    );
    await audit(
      issues,
      page,
      "1.1 Dashboard",
      "/",
      "Branch widget label",
      page.getByText("Branch Sales Today"),
    );
    await audit(
      issues,
      page,
      "1.1 Dashboard",
      "/",
      "Alerts header",
      page.getByText("Inventory Alerts"),
    );

    const healthyEmpty = page.getByText("Stock and expiry levels look healthy");
    const alertRow = page.locator("a").filter({ has: page.getByText(/low stock|expiring/i) }).first();

    if (await healthyEmpty.isVisible()) {
      await audit(issues, page, "1.1 Dashboard", "/", "Alerts empty text", healthyEmpty);
      await audit(
        issues,
        page,
        "1.1 Dashboard",
        "/",
        "Alerts empty icon",
        page.locator(".dashboard-widget").filter({ hasText: "Inventory Alerts" }).locator("svg").first(),
      );
      await auditCssToken(
        issues,
        page,
        "1.1 Dashboard",
        "/",
        "Alerts empty icon token",
        "--widget-alerts-empty-icon",
      );
    } else if (await alertRow.count()) {
      const hoverChanged = await hoverBackgroundChanged(page, alertRow);
      if (hoverChanged === false) {
        issues.push({
          phase: "1.1 Dashboard",
          route: "/",
          label: "Alert row hover",
          severity: "P1",
          detail: "hover did not change background — check --widget-alerts-*-row-hover tokens",
        });
      }
      await alertRow.hover();
      await audit(issues, page, "1.1 Dashboard", "/ (hover)", "Alert row hover bg", alertRow);
    }

    await auditCssToken(
      issues,
      page,
      "1.1 Dashboard",
      "/",
      "Alert row hover token",
      "--widget-alerts-low-row-hover",
    );

    await page.screenshot({ path: join(reportDir, "phase1-01-dashboard.png"), fullPage: true });
  });

  test("1.2 KDS — tickets, urgency tokens, empty/connection", async ({ page }) => {
    await prepareDarkAdminSession(page, adminEmail, adminPassword);
    await page.goto("/kds");
    await page.waitForLoadState("networkidle");

    await auditCssToken(
      issues,
      page,
      "1.2 KDS",
      "/kds",
      "On-time header token",
      "--kds-on-time-header",
      /var\(--semantic-success\)\s*$/,
    );
    await auditCssToken(issues, page, "1.2 KDS", "/kds", "Empty icon token", "--kds-empty-icon");

    const connectionBadge = page.getByText(/live sync|offline/i).first();
    if (await connectionBadge.isVisible()) {
      await audit(issues, page, "1.2 KDS", "/kds", "Connection badge", connectionBadge);
    }

    const emptyState = page.getByText("No pending orders");
    const startButton = page.getByRole("button", { name: /start/i }).first();

    if (await emptyState.isVisible()) {
      await audit(issues, page, "1.2 KDS", "/kds", "Empty state text", emptyState);
      await audit(
        issues,
        page,
        "1.2 KDS",
        "/kds",
        "Empty state icon",
        page.locator("main svg, [class*='kds']").first(),
      );
    } else if (await startButton.isVisible()) {
      await audit(issues, page, "1.2 KDS", "/kds", "Start button", startButton);
      await audit(
        issues,
        page,
        "1.2 KDS",
        "/kds",
        "Ticket qty accent",
        page.locator("[class*='font-black']").filter({ hasText: /\d+x/i }).first(),
      );
    } else {
      issues.push({
        phase: "1.2 KDS",
        route: "/kds",
        label: "KDS content",
        severity: "P2",
        detail: "neither empty state nor active tickets detected — branch may lack orders",
      });
    }

    await page.screenshot({ path: join(reportDir, "phase1-02-kds.png"), fullPage: true });
  });

  test("1.3 POS Terminal — categories, cart, summary", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await enableDarkMode(page);
    await login(page, staffEmail, adminPassword);
    await page.goto("/pos/terminal");
    await page.waitForLoadState("networkidle");

    const categoryAll = page.getByRole("button", { name: "All", exact: true });
    if (await categoryAll.isVisible()) {
      await audit(issues, page, "1.3 POS", "/pos/terminal", "Active category chip", categoryAll);
      const inactiveChip = page.getByRole("button").filter({ hasNotText: /^All$/ }).first();
      if (await inactiveChip.count()) {
        await audit(issues, page, "1.3 POS", "/pos/terminal", "Inactive category chip", inactiveChip);
      }
    }

    await audit(issues, page, "1.3 POS", "/pos/terminal", "Cart empty label", page.getByText("Cart is empty"));
    await auditCssToken(issues, page, "1.3 POS", "/pos/terminal", "Empty cart icon token", "--state-empty-icon");

    const addButton = page.getByRole("button", { name: "Add" }).first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(400);
      const modifierClose = page.getByRole("button", { name: /close|cancel|skip|continue|add to cart/i }).first();
      if (await modifierClose.isVisible()) {
        await modifierClose.click();
        await page.waitForTimeout(300);
      }
    }

    const summaryTotal = page.locator("text=/total/i").first();
    if (await summaryTotal.isVisible()) {
      await audit(issues, page, "1.3 POS", "/pos/terminal", "Summary total label", summaryTotal);
    }

    await auditCssToken(
      issues,
      page,
      "1.3 POS",
      "/pos/terminal",
      "Summary panel bg token",
      "--pos-summary-bg",
    );

    await page.screenshot({ path: join(reportDir, "phase1-03-pos-terminal.png"), fullPage: true });
  });

  test("1.4 POS Orders + Settlement — table chrome", async ({ page }) => {
    await prepareDarkAdminSession(page, adminEmail, adminPassword);

    await page.goto("/pos/orders");
    await page.waitForLoadState("networkidle");
    await audit(
      issues,
      page,
      "1.4 POS Orders",
      "/pos/orders",
      "Page heading",
      page.getByRole("heading").first(),
    );
    await page.screenshot({ path: join(reportDir, "phase1-04-pos-orders.png"), fullPage: true });

    await page.goto("/pos/settlement");
    await page.waitForLoadState("networkidle");
    await audit(
      issues,
      page,
      "1.4 Settlement",
      "/pos/settlement",
      "Page heading",
      page.getByRole("heading").first(),
    );
    await auditCssToken(
      issues,
      page,
      "1.4 Settlement",
      "/pos/settlement",
      "Settlement highlight token",
      "--pos-settlement-highlight",
    );
    await page.screenshot({ path: join(reportDir, "phase1-05-pos-settlement.png"), fullPage: true });
  });
});
