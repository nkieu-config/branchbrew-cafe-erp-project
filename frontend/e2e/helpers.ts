import { expect, type Page } from "@playwright/test";

export const HOME_PATH = "/";

export const MANAGER_EMAIL = process.env.E2E_EMAIL ?? "manager@branchbrew.dev";
export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@branchbrew.dev";
export const E2E_PASSWORD = process.env.E2E_PASSWORD ?? "password123";

export function signInSubmitButton(page: Page) {
  return page.getByRole("button", { name: /^sign in$/i });
}

export function demoManagerButton(page: Page) {
  return page.getByRole("button", { name: /sign in as demo manager/i });
}

export async function signInWithCredentials(
  page: Page,
  email: string,
  password: string,
) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await signInSubmitButton(page).click();
  await page.waitForURL(HOME_PATH);
}

export async function expectAuthenticatedDashboard(page: Page) {
  await page.goto(HOME_PATH);
  await expect(page.getByText(/today's sales/i)).toBeVisible({ timeout: 30_000 });
}

export async function expectPosTerminalReady(page: Page) {
  await expect(
    page
      .getByRole("heading", { name: /current order/i })
      .or(page.getByText(/select a branch/i)),
  ).toBeVisible({ timeout: 15_000 });
}
