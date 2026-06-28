import { describe, expect, it } from "vitest";
import type { Ingredient } from "@/types/api";
import {
  ingredientIsActive,
  ingredientMissingCost,
  matchesIngredientCostFilter,
  matchesIngredientStatusFilter,
} from "./ingredient-filters";

function ing(overrides: Partial<Ingredient> = {}): Ingredient {
  return {
    id: 1,
    name: "Milk",
    unit: "ml",
    costPerUnit: 0.5,
    isActive: true,
    ...overrides,
  };
}

describe("ingredient-filters", () => {
  it("detects active state", () => {
    expect(ingredientIsActive(ing())).toBe(true);
    expect(ingredientIsActive(ing({ isActive: false }))).toBe(false);
  });

  it("detects missing cost", () => {
    expect(ingredientMissingCost(ing({ costPerUnit: 0 }))).toBe(true);
    expect(ingredientMissingCost(ing({ costPerUnit: undefined }))).toBe(true);
    expect(ingredientMissingCost(ing({ costPerUnit: 1.2 }))).toBe(false);
  });

  it("filters by status and cost", () => {
    expect(matchesIngredientStatusFilter(ing(), "active")).toBe(true);
    expect(matchesIngredientCostFilter(ing({ costPerUnit: 0 }), "missing-cost")).toBe(true);
  });
});
