import { describe, it, expect, beforeEach } from "vitest";
import {
  getStoredBranchSelection,
  setStoredBranchId,
  resolveDefaultBranchId,
} from "./branch-storage";

describe("branch-storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns unset when nothing stored", () => {
    expect(getStoredBranchSelection()).toBe("unset");
  });

  it("persists branch id and all-branches sentinel", () => {
    setStoredBranchId(3);
    expect(getStoredBranchSelection()).toBe(3);

    setStoredBranchId(null);
    expect(getStoredBranchSelection()).toBe(null);
  });

  it("prefers Downtown as demo default", () => {
    const id = resolveDefaultBranchId([
      { id: 1, name: "BranchBrew Central Kitchen" },
      { id: 2, name: "Downtown Branch" },
    ]);
    expect(id).toBe(2);
  });
});
