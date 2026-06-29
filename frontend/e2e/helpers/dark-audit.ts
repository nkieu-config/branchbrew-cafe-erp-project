import { type Locator, type Page } from "@playwright/test";
import { type AuditIssue, type ContrastSample, issueFromSample } from "./contrast";

export type { AuditIssue };

export async function enableDarkMode(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("theme", "dark");
  });
}

export async function expectDarkRoot(page: Page) {
  await page.waitForFunction(() => document.documentElement.classList.contains("dark"));
}

export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await expectDarkRoot(page);
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30_000 });
  await expectDarkRoot(page);
  await page.waitForLoadState("networkidle");
}

async function openBranchPicker(page: Page) {
  const picker = page.getByLabel("Select branch");
  await picker.waitFor({ state: "visible", timeout: 20_000 });
  await picker.click();
}

export async function selectFirstBranch(page: Page) {
  try {
    await openBranchPicker(page);
  } catch {
    return false;
  }

  const branchOption = page
    .getByRole("option")
    .filter({ hasNotText: /all branches/i })
    .first();
  if (!(await branchOption.count())) {
    await page.keyboard.press("Escape");
    return false;
  }
  await branchOption.click();
  await page.waitForTimeout(500);
  return true;
}

export async function selectCentralKitchenBranch(page: Page) {
  try {
    await openBranchPicker(page);
  } catch {
    return false;
  }

  const branchOption = page.getByRole("option", { name: /central kitchen/i }).first();
  if (!(await branchOption.count())) {
    await page.keyboard.press("Escape");
    return false;
  }
  await branchOption.click();
  await page.waitForTimeout(500);
  return true;
}

export async function switchToCentralKitchenViaKitchenPage(page: Page) {
  await page.goto("/kitchen");
  await page.waitForLoadState("networkidle");
  const switchBtn = page.getByRole("button", { name: /switch to.*central kitchen/i });
  if (!(await switchBtn.isVisible())) return false;
  await switchBtn.click();
  await page.waitForTimeout(500);
  return true;
}

export async function sampleLocator(
  page: Page,
  label: string,
  locator: Locator,
): Promise<ContrastSample | null> {
  if ((await locator.count()) === 0) return null;
  return locator.first().evaluate((el, sampleLabel) => {
    function parseColor(input: string) {
      const value = input.trim();
      if (!value || value === "transparent") return null;

      const probe = document.createElement("span");
      probe.style.color = value;
      document.body.appendChild(probe);
      const computed = getComputedStyle(probe).color;
      probe.remove();

      const rgbMatch = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!rgbMatch) return null;
      return {
        r: Number(rgbMatch[1]),
        g: Number(rgbMatch[2]),
        b: Number(rgbMatch[3]),
      };
    }

    function getBackground(node: Element) {
      let current: Element | null = node;
      while (current) {
        const style = getComputedStyle(current);
        const bg = parseColor(style.backgroundColor);
        if (bg && style.backgroundColor !== "rgba(0, 0, 0, 0)") {
          return bg;
        }
        current = current.parentElement;
      }
      return parseColor(getComputedStyle(document.body).backgroundColor) ?? { r: 0, g: 0, b: 0 };
    }

    function luminance({ r, g, b }: { r: number; g: number; b: number }) {
      const transform = (channel: number) => {
        const s = channel / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
    }

    function ratio(fg: { r: number; g: number; b: number }, bg: { r: number; g: number; b: number }) {
      const l1 = luminance(fg);
      const l2 = luminance(bg);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }

    const style = getComputedStyle(el);
    const fg = parseColor(style.color);
    const bg = getBackground(el);
    if (!fg || !bg) return null;
    const fontSize = Number.parseFloat(style.fontSize) || 16;
    const fontWeight = Number.parseInt(style.fontWeight, 10) || 400;
    const minRequired = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700) ? 3 : 4.5;
    const sampleRatio = ratio(fg, bg);
    return {
      label: sampleLabel,
      selector: el.tagName.toLowerCase(),
      fg,
      bg,
      ratio: sampleRatio,
      fontSize,
      fontWeight,
      minRequired,
      pass: sampleRatio >= minRequired,
    };
  }, label);
}

export async function audit(
  issues: AuditIssue[],
  page: Page,
  phase: string,
  route: string,
  label: string,
  locator: Locator,
) {
  const sample = await sampleLocator(page, label, locator);
  if (!sample) {
    issues.push({
      phase,
      route,
      label,
      severity: "P0",
      detail: "element not found or color could not be sampled",
    });
    return;
  }
  if (!sample.pass) {
    issues.push(issueFromSample(phase, route, sample));
  }
}

export async function auditCssToken(
  issues: AuditIssue[],
  page: Page,
  phase: string,
  route: string,
  label: string,
  token: string,
  forbidden?: RegExp,
) {
  const value = await page.evaluate(
    (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim(),
    token,
  );
  if (!value) {
    issues.push({ phase, route, label, severity: "P1", detail: `${token} is empty` });
    return;
  }
  if (forbidden?.test(value)) {
    issues.push({
      phase,
      route,
      label,
      severity: "P1",
      detail: `${token} looks like light-mode (${value})`,
    });
  }
}

export async function hoverBackgroundChanged(page: Page, locator: Locator): Promise<boolean | null> {
  if ((await locator.count()) === 0) return null;
  const before = await locator.first().evaluate((el) => getComputedStyle(el).backgroundColor);
  await locator.first().hover();
  await page.waitForTimeout(150);
  const after = await locator.first().evaluate((el) => getComputedStyle(el).backgroundColor);
  return before !== after;
}

export function logIssues(phase: string, issues: AuditIssue[]) {
  // eslint-disable-next-line no-console
  console.log(`\n=== ${phase} dark mode audit: ${issues.length} issue(s) ===`);
  for (const issue of issues) {
    // eslint-disable-next-line no-console
    console.log(`[${issue.severity}] ${issue.phase} @ ${issue.route} — ${issue.label}: ${issue.detail}`);
  }
}

export async function prepareDarkAdminSession(page: Page, email: string, password: string) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enableDarkMode(page);
  await login(page, email, password);
  await selectFirstBranch(page);
}
