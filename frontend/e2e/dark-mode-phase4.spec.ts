import { test } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  type AuditIssue,
  audit,
  auditCssToken,
  logIssues,
  prepareDarkAdminSession,
} from "./helpers/dark-audit";

const adminEmail = process.env.E2E_EMAIL ?? "admin@qafacafe.com";
const adminPassword = process.env.E2E_PASSWORD ?? "password123";

const issues: AuditIssue[] = [];
const reportDir = join(__dirname, "reports");

test.describe("dark mode spot-check — Phase 4", () => {
  test.beforeAll(() => {
    mkdirSync(reportDir, { recursive: true });
  });

  test.afterAll(() => {
    writeFileSync(
      join(reportDir, "dark-mode-phase4.json"),
      JSON.stringify({ generatedAt: new Date().toISOString(), issues }, null, 2),
    );
    logIssues("Phase 4", issues);
  });

  test("4.1 Assets — equipment hub + empty/table tones", async ({ page }) => {
    await prepareDarkAdminSession(page, adminEmail, adminPassword);

    await page.goto("/assets");
    await page.waitForLoadState("networkidle");

    await audit(
      issues,
      page,
      "4.1 Assets",
      "/assets",
      "Page heading",
      page.getByRole("heading").first(),
    );
    await auditCssToken(
      issues,
      page,
      "4.1 Assets",
      "/assets",
      "Assets hub icon token",
      "--hub-assets-icon",
      /black/,
    );

    const registerCta = page.getByRole("button", { name: /register equipment/i });
    if (await registerCta.isVisible()) {
      await audit(issues, page, "4.1 Assets", "/assets", "Register equipment CTA", registerCta);
    }

    const statusBadge = page.locator(".ant-table-tbody").getByText(/active|maintenance|broken|retired/i).first();
    if (await statusBadge.count()) {
      await audit(issues, page, "4.1 Assets", "/assets", "Equipment status badge", statusBadge);
    } else {
      const emptyHint = page.getByText(/register your first asset|no equipment/i).first();
      if (await emptyHint.isVisible()) {
        await audit(issues, page, "4.1 Assets", "/assets", "Empty state hint", emptyHint);
      }
    }

    await page.screenshot({ path: join(reportDir, "phase4-01-assets.png"), fullPage: true });
  });

  test("4.2 Organization — branches + users", async ({ page }) => {
    await prepareDarkAdminSession(page, adminEmail, adminPassword);

    await page.goto("/organization/branches");
    await page.waitForLoadState("networkidle");

    await audit(
      issues,
      page,
      "4.2 Organization",
      "/organization/branches",
      "Branches heading",
      page.getByRole("heading").first(),
    );
    await auditCssToken(
      issues,
      page,
      "4.2 Organization",
      "/organization/branches",
      "Organization hub icon token",
      "--hub-organization-icon",
      /black/,
    );

    const centralKitchenCard = page.locator("article").filter({ hasText: "Qafa Central Kitchen" });
    if (await centralKitchenCard.count()) {
      await audit(
        issues,
        page,
        "4.2 Organization",
        "/organization/branches",
        "Central kitchen badge",
        centralKitchenCard.locator("span").filter({ hasText: /central kitchen/i }),
      );
      await audit(
        issues,
        page,
        "4.2 Organization",
        "/organization/branches",
        "Branch card title",
        centralKitchenCard.locator("h3"),
      );
    }

    const franchiseCard = page.locator("article").filter({ hasText: "Siam Paragon" });
    if (await franchiseCard.count()) {
      await audit(
        issues,
        page,
        "4.2 Organization",
        "/organization/branches",
        "Franchise badge",
        franchiseCard.locator("span").filter({ hasText: /^Franchise$/ }),
      );
    }

    await page.screenshot({ path: join(reportDir, "phase4-02-branches.png"), fullPage: true });

    await page.goto("/organization/users");
    await page.waitForLoadState("networkidle");

    await audit(
      issues,
      page,
      "4.2 Organization",
      "/organization/users",
      "Users heading",
      page.getByRole("heading").first(),
    );

    const roleBadge = page
      .locator(".ant-table-tbody, article")
      .getByText(/super admin|manager|staff/i)
      .first();
    if (await roleBadge.count()) {
      await audit(issues, page, "4.2 Organization", "/organization/users", "Role badge", roleBadge);
    }

    const userRow = page.locator(".ant-table-tbody tr").first();
    if (await userRow.count()) {
      await audit(
        issues,
        page,
        "4.2 Organization",
        "/organization/users",
        "User table row",
        userRow.locator("td").first(),
      );
    }

    await page.screenshot({ path: join(reportDir, "phase4-03-users.png"), fullPage: true });
  });

  test("4.3 Settings — general + audit trail", async ({ page }) => {
    await prepareDarkAdminSession(page, adminEmail, adminPassword);

    await page.goto("/settings");
    await page.waitForLoadState("networkidle");

    await audit(
      issues,
      page,
      "4.3 Settings",
      "/settings",
      "Settings heading",
      page.getByRole("heading").first(),
    );
    await auditCssToken(
      issues,
      page,
      "4.3 Settings",
      "/settings",
      "Settings hub icon token",
      "--hub-settings-icon",
      /black/,
    );

    const sectionTitle = page.getByText("Company information", { exact: true });
    if (await sectionTitle.isVisible()) {
      await audit(issues, page, "4.3 Settings", "/settings", "Settings section title", sectionTitle);
    }

    const vatLabel = page.getByText("VAT rate (%)", { exact: true });
    if (await vatLabel.isVisible()) {
      await audit(issues, page, "4.3 Settings", "/settings", "VAT rate label", vatLabel);
    }

    const saveBtn = page.getByRole("button", { name: /save/i });
    if (await saveBtn.isVisible()) {
      await audit(issues, page, "4.3 Settings", "/settings", "Save settings button", saveBtn);
    }

    await page.screenshot({ path: join(reportDir, "phase4-04-settings.png"), fullPage: true });

    await page.goto("/settings/audit");
    await page.waitForLoadState("networkidle");

    await audit(
      issues,
      page,
      "4.3 Settings",
      "/settings/audit",
      "Audit trail heading",
      page.getByRole("heading").first(),
    );

    const auditRow = page.locator("tbody tr").first();
    if (await auditRow.count()) {
      const actionBadge = auditRow.getByText(/create|update|delete|login/i).first();
      if (await actionBadge.count()) {
        await audit(issues, page, "4.3 Settings", "/settings/audit", "Audit action badge", actionBadge);
      }
      await audit(issues, page, "4.3 Settings", "/settings/audit", "Audit log row", auditRow.locator("td").first());

      const viewBtn = auditRow.getByRole("button", { name: /view|details/i }).first();
      if (await viewBtn.count()) {
        await viewBtn.click();
        await page.waitForTimeout(400);
        const sheetTitle = page.getByText(/audit detail|log detail/i).first();
        if (await sheetTitle.isVisible()) {
          await audit(issues, page, "4.3 Settings", "/settings/audit", "Audit detail sheet title", sheetTitle);
        }
        await page.screenshot({ path: join(reportDir, "phase4-05-audit-detail.png"), fullPage: true });
        await page.keyboard.press("Escape");
      }
    } else {
      const emptyAudit = page.getByText(/no audit logs|no entries/i).first();
      if (await emptyAudit.isVisible()) {
        await audit(issues, page, "4.3 Settings", "/settings/audit", "Audit empty state", emptyAudit);
      }
    }

    await page.screenshot({ path: join(reportDir, "phase4-05-audit.png"), fullPage: true });
  });
});
