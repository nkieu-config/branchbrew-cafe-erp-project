import { test as setup } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { prepareLightAdminSession } from "./helpers/theme-audit";

const adminEmail = process.env.E2E_EMAIL ?? "admin@qafacafe.com";
const adminPassword = process.env.E2E_PASSWORD ?? "password123";
const authDir = join(__dirname, ".auth");

setup("authenticate admin (light)", async ({ page }) => {
  mkdirSync(authDir, { recursive: true });
  await prepareLightAdminSession(page, adminEmail, adminPassword);
  await page.context().storageState({ path: join(authDir, "admin-light.json") });
});
