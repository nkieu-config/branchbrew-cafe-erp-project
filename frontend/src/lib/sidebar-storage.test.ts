import { describe, expect, it } from "vitest";
import {
  MAX_PINNED_SIDEBAR_ITEMS,
  mergeExpandedGroupsForActivePath,
  sanitizePinnedSidebarItems,
} from "./sidebar-storage";

describe("sanitizePinnedSidebarItems", () => {
  it("keeps order and drops disallowed ids", () => {
    expect(sanitizePinnedSidebarItems(["inventory", "kds", "finance"], ["inventory", "finance"])).toEqual([
      "inventory",
      "finance",
    ]);
  });

  it("deduplicates ids", () => {
    expect(sanitizePinnedSidebarItems(["inventory", "inventory"], ["inventory"])).toEqual(["inventory"]);
  });

  it("caps at max pinned items", () => {
    const ids = ["a", "b", "c", "d", "e", "f", "g"];
    const allowed = ids;
    expect(sanitizePinnedSidebarItems(ids, allowed)).toHaveLength(MAX_PINNED_SIDEBAR_ITEMS);
  });
});

describe("mergeExpandedGroupsForActivePath", () => {
  it("expands the group containing the active route", () => {
    const prev = {
      "Overview & Analytics": true,
      "Store Operations": false,
      "Back Office": false,
      "System Admin": false,
    };
    const next = mergeExpandedGroupsForActivePath(prev, "/inventory/batches");
    expect(next["Store Operations"]).toBe(true);
  });

  it("returns same reference when no change needed", () => {
    const prev = {
      "Overview & Analytics": true,
      "Store Operations": true,
      "Back Office": false,
      "System Admin": false,
    };
    expect(mergeExpandedGroupsForActivePath(prev, "/inventory")).toBe(prev);
  });
});
