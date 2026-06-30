import { describe, expect, it } from "vitest";
import type { Branch } from "@/types/api";
import {
  branchTypeLabel,
  filterBranches,
  summarizeBranches,
} from "./branch-filters";

describe("branch-filters", () => {
  const branches = [
    { id: 1, name: "HQ Kitchen", isCentralKitchen: true, location: "Metro City" },
    { id: 2, name: "Downtown", isCentralKitchen: false, location: "Central District" },
  ] as Branch[];

  it("labels branch types", () => {
    expect(branchTypeLabel(true)).toBe("Central kitchen");
    expect(branchTypeLabel(false)).toBe("Franchise");
  });

  it("summarizes branch portfolio", () => {
    const summary = summarizeBranches(branches);
    expect(summary.total).toBe(2);
    expect(summary.centralKitchen).toBe(1);
    expect(summary.franchise).toBe(1);
  });

  it("filters branches by type and search", () => {
    const central = filterBranches(branches, {
      typeFilter: "central",
      search: "",
    });
    expect(central).toHaveLength(1);

    const byName = filterBranches(branches, {
      typeFilter: "ALL",
      search: "downtown",
    });
    expect(byName).toHaveLength(1);
  });
});
