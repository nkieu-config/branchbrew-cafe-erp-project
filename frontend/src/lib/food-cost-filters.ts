import type { Product } from "@/types/api";
import { toNumber } from "@/lib/money";
import {
  calcProductFoodCost,
  foodCostStatus,
} from "@/lib/food-cost";
import {
  productHasRecipe,
  productIsActive,
} from "@/lib/menu-product-filters";

export type FoodCostStatusFilter =
  | "ALL"
  | "good"
  | "warn"
  | "bad"
  | "no-recipe"
  | "missing-cost";

export type FoodCostActiveFilter = "ALL" | "active" | "inactive";

export type FoodCostBucket =
  | "good"
  | "warn"
  | "bad"
  | "no-recipe"
  | "no-price";

export function productFoodCostBucket(product: Product): FoodCostBucket {
  if (!productHasRecipe(product)) return "no-recipe";
  const price = toNumber(product.price);
  if (price <= 0) return "no-price";
  const { foodCostPercent } = calcProductFoodCost(product);
  return foodCostStatus(foodCostPercent);
}

export function productHasMissingIngredientCost(product: Product): boolean {
  const items = product.recipeItems ?? [];
  if (items.length === 0) return false;
  return items.some(
    (row) =>
      row.ingredient == null ||
      row.ingredient.costPerUnit == null ||
      toNumber(row.ingredient.costPerUnit) <= 0,
  );
}

export function matchesFoodCostStatusFilter(
  product: Product,
  filter: FoodCostStatusFilter,
): boolean {
  if (filter === "ALL") return true;
  if (filter === "missing-cost") return productHasMissingIngredientCost(product);
  const bucket = productFoodCostBucket(product);
  if (filter === "no-recipe") return bucket === "no-recipe";
  return bucket === filter;
}

export function matchesFoodCostActiveFilter(
  product: Product,
  filter: FoodCostActiveFilter,
): boolean {
  if (filter === "ALL") return true;
  return filter === "active" ? productIsActive(product) : !productIsActive(product);
}

export function summarizeFoodCost(products: Product[]) {
  let good = 0;
  let warn = 0;
  let bad = 0;
  let noRecipe = 0;
  let noPrice = 0;
  let missingCost = 0;
  let active = 0;
  let percentSum = 0;
  let percentCount = 0;

  for (const product of products) {
    if (productIsActive(product)) active += 1;
    if (productHasMissingIngredientCost(product)) missingCost += 1;

    const bucket = productFoodCostBucket(product);
    switch (bucket) {
      case "good":
        good += 1;
        break;
      case "warn":
        warn += 1;
        break;
      case "bad":
        bad += 1;
        break;
      case "no-recipe":
        noRecipe += 1;
        break;
      case "no-price":
        noPrice += 1;
        break;
    }

    if (bucket === "good" || bucket === "warn" || bucket === "bad") {
      const { foodCostPercent } = calcProductFoodCost(product);
      percentSum += foodCostPercent;
      percentCount += 1;
    }
  }

  return {
    total: products.length,
    active,
    good,
    warn,
    bad,
    noRecipe,
    noPrice,
    missingCost,
    avgPercent: percentCount > 0 ? percentSum / percentCount : 0,
  };
}
