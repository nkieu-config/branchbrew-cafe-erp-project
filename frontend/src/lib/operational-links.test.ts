import { describe, expect, it } from "vitest";
import {
  appendOperationalQuery,
  resolveChildTabHref,
  resolveHubLandingPath,
  resolveSidebarItemHref,
} from "./operational-links";

describe("operational-links", () => {
  it("appends query params to href", () => {
    expect(appendOperationalQuery("/procurement/orders", { status: "PENDING" })).toBe(
      "/procurement/orders?status=PENDING",
    );
  });

  it("routes procurement hub to pending POs when badge active", () => {
    expect(
      resolveHubLandingPath("procurement", {
        procurement: { count: 2, tone: "warning", label: "2 POs" },
      }),
    ).toBe("/procurement/orders?status=PENDING");
  });

  it("routes hr hub to pending leave when badge active", () => {
    expect(
      resolveHubLandingPath("hr", {
        hr: { count: 1, tone: "info", label: "1 leave" },
      }),
    ).toBe("/hr/leave?status=PENDING");
  });

  it("routes inventory to low stock when child badge active", () => {
    expect(
      resolveHubLandingPath("inventory", {
        "/inventory": { count: 3, tone: "warning", label: "3 low" },
      }),
    ).toBe("/inventory?filter=low");
  });

  it("deep-links child tabs with operational query", () => {
    expect(
      resolveChildTabHref("/finance/overview", {
        "/finance/overview": { count: 1, tone: "warning", label: "1 settlement" },
      }),
    ).toBe("/finance/overview?status=PENDING");
  });

  it("falls back to default sidebar href without badges", () => {
    expect(resolveSidebarItemHref("procurement", "/procurement", {})).toBe("/procurement");
  });
});
