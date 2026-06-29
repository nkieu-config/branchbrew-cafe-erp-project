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

export function matchesIngredientSearch(ingredient: Ingredient, search: string): boolean {
  if (!search) return true;
  const haystack = [
    ingredient.name,
    ingredient.unit,
    ingredient.primarySupplier?.name ?? "",
    String(ingredient.id),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(search);
}

export function summarizeIngredients(ingredients: Ingredient[]) {
  let active = 0;
  let inactive = 0;
  let missingCost = 0;
  for (const item of ingredients) {
    if (ingredientIsActive(item)) active += 1;
    else inactive += 1;
    if (ingredientMissingCost(item)) missingCost += 1;
  }
  return { total: ingredients.length, active, inactive, missingCost };
}

export function filterIngredients(
  ingredients: Ingredient[],
  options: {
    search: string;
    statusFilter: IngredientStatusFilter;
    costFilter: IngredientCostFilter;
  },
): Ingredient[] {
  return ingredients.filter(
    (item) =>
      matchesIngredientSearch(item, options.search) &&
      matchesIngredientStatusFilter(item, options.statusFilter) &&
      matchesIngredientCostFilter(item, options.costFilter),
  );
}

export function hasIngredientFilters(options: {
  search: string;
  statusFilter: IngredientStatusFilter;
  costFilter: IngredientCostFilter;
}): boolean {
  return (
    options.search.trim().length > 0 ||
    options.statusFilter !== "ALL" ||
    options.costFilter !== "ALL"
  );
}
