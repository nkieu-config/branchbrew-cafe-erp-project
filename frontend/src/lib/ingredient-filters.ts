import type { Ingredient } from "@/types/api";

export type IngredientStatusFilter = "ALL" | "active" | "inactive";
export type IngredientCostFilter = "ALL" | "missing-cost";

export function ingredientIsActive(ingredient: Ingredient): boolean {
  return ingredient.isActive !== false;
}

export function ingredientMissingCost(ingredient: Ingredient): boolean {
  const cost = ingredient.costPerUnit;
  return cost == null || cost <= 0;
}

export function matchesIngredientStatusFilter(
  ingredient: Ingredient,
  filter: IngredientStatusFilter,
): boolean {
  if (filter === "ALL") return true;
  return filter === "active"
    ? ingredientIsActive(ingredient)
    : !ingredientIsActive(ingredient);
}

export function matchesIngredientCostFilter(
  ingredient: Ingredient,
  filter: IngredientCostFilter,
): boolean {
  if (filter === "ALL") return true;
  return ingredientMissingCost(ingredient);
}
