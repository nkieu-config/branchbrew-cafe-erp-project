import { describe, expect, it } from "vitest";
import type { BomGroupRow, ProductionBOM } from "@/types/api";
import {
  getBomTargetIds,
  matchesBomSearch,
  productionBomHasTarget,
  summarizeProductionBoms,
} from "./bom-filters";

describe("bom-filters", () => {
  const group: BomGroupRow = {
    id: "TARGET_1",
    targetName: "Sauce",
    targetUnit: "L",
    isGroup: true,
    children: [
      {
        id: 1,
        rawIngredientId: 2,
        rawName: "Tomato",
        rawUnit: "kg",
        quantityNeeded: 2,
        costPerUnit: 0,
        totalCost: 0,
      },
    ],
  };

  it("summarizes BOM portfolio", () => {
    const summary = summarizeProductionBoms([group]);
    expect(summary.targets).toBe(1);
    expect(summary.rawLines).toBe(1);
    expect(summary.missingCostLines).toBe(1);
  });

  it("detects target BOM coverage", () => {
    const boms = [{ targetIngredientId: 5 }] as ProductionBOM[];
    expect(productionBomHasTarget(boms, 5)).toBe(true);
    expect(getBomTargetIds(boms).has(5)).toBe(true);
  });

  it("searches target and raw names", () => {
    expect(matchesBomSearch(group, "tomato")).toBe(true);
    expect(matchesBomSearch(group, "bread")).toBe(false);
  });
});
