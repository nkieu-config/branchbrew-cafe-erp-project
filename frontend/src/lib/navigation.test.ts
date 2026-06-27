import { describe, expect, it } from "vitest";
import {
  HUBS,
  findHubByPathname,
  getVisibleHubTabs,
  isTabActive,
  resolveBreadcrumbTrail,
} from "./navigation";

describe("resolveBreadcrumbTrail", () => {
  it("returns dashboard for root path", () => {
    expect(resolveBreadcrumbTrail("/")).toEqual([{ label: "Dashboard", href: null }]);
  });

  it("returns hub-only trail on hub root tab", () => {
    expect(resolveBreadcrumbTrail("/inventory")).toEqual([
      { label: "Inventory", href: null },
    ]);
  });

  it("returns hub and tab with tab linkable from hub", () => {
    expect(resolveBreadcrumbTrail("/inventory/batches")).toEqual([
      { label: "Inventory", href: "/inventory" },
      { label: "Batches & Expiry", href: null },
    ]);
  });

  it("returns three levels when nested under a tab", () => {
    expect(resolveBreadcrumbTrail("/inventory/batches/lot-42")).toEqual([
      { label: "Inventory", href: "/inventory" },
      { label: "Batches & Expiry", href: "/inventory/batches" },
      { label: "Lot 42", href: null },
    ]);
  });

  it("normalizes legacy stock path to batches tab", () => {
    expect(resolveBreadcrumbTrail("/inventory/stock")).toEqual([
      { label: "Inventory", href: "/inventory" },
      { label: "Batches & Expiry", href: null },
    ]);
  });

  it("handles organization hub tabs", () => {
    expect(resolveBreadcrumbTrail("/organization/users")).toEqual([
      { label: "Organization", href: "/organization" },
      { label: "Users & Roles", href: null },
    ]);
  });
});

describe("findHubByPathname", () => {
  it("finds inventory hub for nested routes", () => {
    expect(findHubByPathname("/inventory/transfers")?.id).toBe("inventory");
  });
});

describe("isTabActive", () => {
  it("matches exact base path only for default tab", () => {
    expect(isTabActive("/inventory", "/inventory", "/inventory")).toBe(true);
    expect(isTabActive("/inventory/batches", "/inventory", "/inventory")).toBe(false);
  });

  it("matches nested paths for non-base tabs", () => {
    expect(isTabActive("/inventory/batches/lot-1", "/inventory/batches", "/inventory")).toBe(
      true,
    );
  });
});

describe("hub completeness", () => {
  it("every hub defines at least one tab", () => {
    for (const hub of Object.values(HUBS)) {
      expect(hub.tabs.length, hub.id).toBeGreaterThan(0);
    }
  });

  it("assets hub includes equipment tab", () => {
    const assets = HUBS.assets;
    expect(assets.tabs.some((tab) => tab.path === "/assets/equipment")).toBe(true);
  });
});

describe("getVisibleHubTabs", () => {
  it("orders purchase orders first for staff in procurement", () => {
    const tabs = getVisibleHubTabs("procurement", "STAFF");
    expect(tabs[0]?.path).toBe("/procurement/orders");
  });

  it("orders suppliers first for manager in procurement", () => {
    const tabs = getVisibleHubTabs("procurement", "MANAGER");
    expect(tabs[0]?.path).toBe("/procurement/suppliers");
  });

  it("filters tabs by role", () => {
    const staffHrTabs = getVisibleHubTabs("hr", "STAFF");
    expect(staffHrTabs.some((tab) => tab.path === "/hr/payroll")).toBe(false);
    expect(staffHrTabs.some((tab) => tab.path === "/hr/employees")).toBe(true);
  });
});

describe("legacy breadcrumb paths", () => {
  it("maps procurement transfers redirect to inventory transfers tab", () => {
    expect(resolveBreadcrumbTrail("/procurement/transfers")).toEqual([
      { label: "Inventory", href: "/inventory" },
      { label: "Stock Transfers", href: null },
    ]);
  });

  it("maps legacy users path to organization users tab", () => {
    expect(resolveBreadcrumbTrail("/users")).toEqual([
      { label: "Organization", href: "/organization" },
      { label: "Users & Roles", href: null },
    ]);
  });
});
