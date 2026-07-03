import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { test as setup } from "@playwright/test";
import { ADMIN_EMAIL, authenticateViaApi, E2E_PASSWORD } from "./helpers";

const authFile = "e2e/.auth/admin.json";

setup("authenticate super admin", async ({ page }) => {
  mkdirSync(dirname(authFile), { recursive: true });

  await authenticateViaApi(page, ADMIN_EMAIL, E2E_PASSWORD);

  await page.context().storageState({ path: authFile });
});
