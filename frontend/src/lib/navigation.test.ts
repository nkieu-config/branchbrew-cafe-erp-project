import { describe, expect, it } from "vitest";
import {
  HUBS,
  findHubByPathname,
  getMobileBottomNavBadgeId,
  getMobileBottomNavItems,
  getVisibleHubTabs,
  isMobileBottomNavActive,
  isTabActive,
  shouldShowHubSubNav,
  resolveBreadcrumbTrail,
  resolveSidebarHubId,
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

  it("assets hub serves equipment at /assets", () => {
    const assets = HUBS.assets;
    expect(assets.tabs.some((tab) => tab.path === "/assets")).toBe(true);
  });

  it("shouldShowHubSubNav hides single root tab hubs", () => {
    expect(shouldShowHubSubNav(HUBS.assets.tabs, HUBS.assets.basePath)).toBe(false);
    expect(shouldShowHubSubNav(HUBS.inventory.tabs, HUBS.inventory.basePath)).toBe(true);
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

describe("getMobileBottomNavItems", () => {
  it("returns four items for staff with KDS instead of orders", () => {
    const items = getMobileBottomNavItems("STAFF");
    expect(items).toHaveLength(4);
    expect(items.map((item) => item.id)).toEqual(["pos", "kds", "inventory", "more"]);
  });

  it("returns orders for manager instead of KDS", () => {
    const items = getMobileBottomNavItems("MANAGER");
    expect(items.map((item) => item.id)).toEqual(["pos", "orders", "inventory", "more"]);
  });

  it("marks POS active on terminal but not orders", () => {
    const pos = getMobileBottomNavItems("STAFF")[0];
    expect(isMobileBottomNavActive(pos, "/pos/terminal")).toBe(true);
    expect(isMobileBottomNavActive(pos, "/pos/orders")).toBe(false);
  });
});

describe("resolveSidebarHubId", () => {
  it("maps hub sidebar items to hub ids", () => {
    expect(resolveSidebarHubId("inventory")).toBe("inventory");
    expect(resolveSidebarHubId("pos")).toBe("pos");
  });

  it("returns aggregate key for more item", () => {
    expect(getMobileBottomNavBadgeId("more")).toBe("aggregate");
  });

  it("returns null for non-hub items", () => {
    expect(resolveSidebarHubId("dashboard")).toBeNull();
    expect(resolveSidebarHubId("kds")).toBeNull();
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
