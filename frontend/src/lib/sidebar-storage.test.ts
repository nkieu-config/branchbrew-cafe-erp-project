import { describe, expect, it } from "vitest";
import { mergeExpandedGroupsForActivePath } from "./sidebar-storage";

describe("mergeExpandedGroupsForActivePath", () => {
  it("expands the group containing the active route", () => {
    const prev = {
      Overview: true,
      Operations: false,
      "Back office": false,
      Admin: false,
    };
    const next = mergeExpandedGroupsForActivePath(prev, "/inventory/batches");
    expect(next.Operations).toBe(true);
  });

  it("returns same reference when no change needed", () => {
    const prev = {
      Overview: true,
      Operations: true,
      "Back office": false,
      Admin: false,
    };
    expect(mergeExpandedGroupsForActivePath(prev, "/inventory")).toBe(prev);
  });
});
