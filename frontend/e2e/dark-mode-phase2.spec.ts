import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  type AuditIssue,
  audit,
  auditCssToken,
  hoverBackgroundChanged,
  logIssues,
  prepareDarkAdminSession,
} from "./helpers/dark-audit";

const adminEmail = process.env.E2E_EMAIL ?? "admin@qafacafe.com";
const adminPassword = process.env.E2E_PASSWORD ?? "password123";

const issues: AuditIssue[] = [];
const reportDir = join(__dirname, "reports");

test.describe("dark mode spot-check — Phase 2", () => {
  test.beforeAll(() => {
    mkdirSync(reportDir, { recursive: true });
  });

  test.afterAll(() => {
    writeFileSync(
      join(reportDir, "dark-mode-phase2.json"),
      JSON.stringify({ generatedAt: new Date().toISOString(), issues }, null, 2),
    );
    logIssues("Phase 2", issues);
  });

  test("P1 regression — dashboard alerts header + table hover warmth", async ({ page }) => {
    await prepareDarkAdminSession(page, adminEmail, adminPassword);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await audit(
      issues,
      page,
      "P1 fix",
      "/",
      "Alerts header",
      page.getByRole("heading", { name: /inventory alerts/i }),
    );

    await page.goto("/pos/orders");
    await page.waitForLoadState("networkidle");

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
        const isPurpleLean = b > r + 15 && b > g + 10;
        if (isPurpleLean) {
          issues.push({
            phase: "P1 fix",
            route: "/pos/orders",
            label: "Table row hover",
            severity: "P1",
            detail: `hover still purple-leaning rgb(${r}, ${g}, ${b})`,
          });
        }
      }

      await hoverBackgroundChanged(page, row);
    }

    await page.screenshot({ path: join(reportDir, "phase2-p1-regression-orders.png"), fullPage: true });
  });

  test("2.1 Inventory batches — expiry heatmap", async ({ page }) => {
    await prepareDarkAdminSession(page, adminEmail, adminPassword);
    await page.goto("/inventory/batches");
    await page.waitForLoadState("networkidle");

    await auditCssToken(
      issues,
      page,
      "2.1 Batches",
      "/inventory/batches",
      "Expiry header bg",
      "--expiry-panel-header-bg",
    );
    await auditCssToken(
      issues,
      page,
      "2.1 Batches",
      "/inventory/batches",
      "Expiry header icon",
      "--expiry-panel-header-icon",
    );

    const heatmapTitle = page.getByText(/expiry heatmap|batch expiry/i).first();
    if (await heatmapTitle.isVisible()) {
      await audit(issues, page, "2.1 Batches", "/inventory/batches", "Heatmap title", heatmapTitle);
    }

    const legend = page.locator("[class*='expiry']").filter({ hasText: /safe|warning|critical|expired/i }).first();
    if (await legend.count()) {
      await audit(issues, page, "2.1 Batches", "/inventory/batches", "Expiry legend", legend);
    }

    await page.screenshot({ path: join(reportDir, "phase2-01-batches.png"), fullPage: true });
  });

  test("2.2 HR payroll — payslip metric tones", async ({ page }) => {
    await prepareDarkAdminSession(page, adminEmail, adminPassword);
    await page.goto("/hr/payroll");
    await page.waitForLoadState("networkidle");

    const otHeader = page.getByRole("columnheader", { name: "OT hrs" });
    const netHeader = page.getByRole("columnheader", { name: "Net pay" });

    const expandRow = page.locator(".ant-table-row-expand-icon").first();
    if (await expandRow.count()) {
      await expandRow.click();
      await page.waitForTimeout(500);
    }

    if (await otHeader.isVisible()) {
      await audit(issues, page, "2.2 Payroll", "/hr/payroll", "OT hrs header", otHeader);
      const otCell = page.locator("td").filter({ has: page.locator("span") }).filter({ hasText: /\d+\.\d/ }).first();
      if (await otCell.count()) {
        await audit(issues, page, "2.2 Payroll", "/hr/payroll", "OT metric value", otCell.locator("span").first());
      }
    }

    if (await netHeader.isVisible()) {
      await audit(issues, page, "2.2 Payroll", "/hr/payroll", "Net pay header", netHeader);
    }

    await auditCssToken(issues, page, "2.2 Payroll", "/hr/payroll", "Ledger debit token", "--ledger-debit-fg");

    await page.screenshot({ path: join(reportDir, "phase2-02-payroll.png"), fullPage: true });
  });

  test("2.3 Finance ledger — journal table + debit/credit", async ({ page }) => {
    await prepareDarkAdminSession(page, adminEmail, adminPassword);
    await page.goto("/finance/ledger");
    await page.waitForLoadState("networkidle");

    await audit(
      issues,
      page,
      "2.3 Ledger",
      "/finance/ledger",
      "Page heading",
      page.getByRole("heading").first(),
    );

    await auditCssToken(issues, page, "2.3 Ledger", "/finance/ledger", "Debit fg token", "--ledger-debit-fg");
    await auditCssToken(issues, page, "2.3 Ledger", "/finance/ledger", "Credit fg token", "--ledger-credit-fg");

    const expandIcon = page.locator(".ant-table-row-expand-icon").first();
    if (await expandIcon.count()) {
      await expandIcon.click();
      await page.waitForTimeout(500);
      const debitCell = page.locator("[class*='ledger-debit'], [class*='--ledger-debit']").first();
      const creditCell = page.locator("[class*='ledger-credit'], [class*='--ledger-credit']").first();
      if (await debitCell.count()) {
        await audit(issues, page, "2.3 Ledger", "/finance/ledger", "Debit amount", debitCell);
      }
      if (await creditCell.count()) {
        await audit(issues, page, "2.3 Ledger", "/finance/ledger", "Credit amount", creditCell);
      }
    }

    await page.screenshot({ path: join(reportDir, "phase2-03-ledger.png"), fullPage: true });
  });
});
