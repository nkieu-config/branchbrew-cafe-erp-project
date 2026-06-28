import { describe, expect, it } from "vitest";
import type { ModifierGroup } from "@/types/api";
import {
  countModifierOptions,
  matchesModifierCategoryFilter,
  matchesModifierHighlightFilter,
  matchesModifierSearch,
  modifierGroupHasSwap,
  modifierGroupIsEmpty,
} from "./modifier-filters";

function group(overrides: Partial<ModifierGroup> = {}): ModifierGroup {
  return {
    id: 1,
    name: "Milk",
    sortOrder: 0,
    options: [],
    ...overrides,
  };
}

describe("modifier-filters", () => {
  it("detects empty groups and swap config", () => {
    expect(modifierGroupIsEmpty(group())).toBe(true);
    expect(modifierGroupHasSwap(group({ swapIngredientId: 2 }))).toBe(true);
  });

  it("counts options across groups", () => {
    const groups = [
      group({ options: [{ id: 1, groupId: 1, name: "A", priceDelta: 0, isDefault: false, sortOrder: 0 }] }),
      group({ id: 2, options: [] }),
    ];
    expect(countModifierOptions(groups)).toBe(1);
  });

  it("filters by category including universal groups", () => {
    expect(matchesModifierCategoryFilter(group({ category: "Coffee" }), "Coffee")).toBe(true);
    expect(matchesModifierCategoryFilter(group({ category: null }), "Coffee")).toBe(true);
    expect(matchesModifierCategoryFilter(group({ category: "Food" }), "Coffee")).toBe(false);
  });

  it("searches group and option names", () => {
    const g = group({
      options: [{ id: 1, groupId: 1, name: "Oat", priceDelta: 0, isDefault: false, sortOrder: 0 }],
    });
    expect(matchesModifierSearch(g, "oat")).toBe(true);
    expect(matchesModifierSearch(g, "tea")).toBe(false);
  });

  it("filters highlight states", () => {
    expect(matchesModifierHighlightFilter(group(), "empty")).toBe(true);
    expect(
      matchesModifierHighlightFilter(group({ swapIngredientId: 3 }), "with-swap"),
    ).toBe(true);
  });
});
