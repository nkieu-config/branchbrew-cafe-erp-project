import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { test as setup } from "@playwright/test";
import { E2E_PASSWORD, MANAGER_EMAIL, signInWithCredentials } from "./helpers";

const authFile = "e2e/.auth/manager.json";

setup("authenticate manager", async ({ page }) => {
  mkdirSync(dirname(authFile), { recursive: true });

  await signInWithCredentials(page, MANAGER_EMAIL, E2E_PASSWORD);

  await page.context().storageState({ path: authFile });
});
