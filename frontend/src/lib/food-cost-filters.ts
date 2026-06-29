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

export const TARGET_FOOD_COST_PERCENT = 30;

export function foodCostStatusLabel(bucket: FoodCostBucket): string {
  switch (bucket) {
    case "good":
      return "On target";
    case "warn":
      return "Watch";
    case "bad":
      return "High cost";
    case "no-recipe":
      return "No recipe";
    case "no-price":
      return "No price";
  }
}

export function foodCostStatusTone(
  bucket: FoodCostBucket,
): "success" | "warning" | "danger" | "neutral" | "info" {
  switch (bucket) {
    case "good":
      return "success";
    case "warn":
      return "warning";
    case "bad":
      return "danger";
    case "no-recipe":
      return "neutral";
    case "no-price":
      return "info";
  }
}

export function matchesFoodCostSearch(product: Product, search: string): boolean {
  if (!search) return true;
  const haystack = [product.name, product.category ?? "", String(product.id)]
    .join(" ")
    .toLowerCase();
  return haystack.includes(search);
}

export function filterFoodCostProducts(
  products: Product[],
  options: {
    search: string;
    categoryFilter: string;
    statusFilter: FoodCostStatusFilter;
    activeFilter: FoodCostActiveFilter;
  },
): Product[] {
  return products.filter(
    (product) =>
      matchesFoodCostSearch(product, options.search) &&
      (options.categoryFilter === "ALL" || product.category === options.categoryFilter) &&
      matchesFoodCostStatusFilter(product, options.statusFilter) &&
      matchesFoodCostActiveFilter(product, options.activeFilter),
  );
}

export function hasFoodCostFilters(options: {
  search: string;
  categoryFilter: string;
  statusFilter: FoodCostStatusFilter;
  activeFilter: FoodCostActiveFilter;
}): boolean {
  return (
    options.search.trim().length > 0 ||
    options.categoryFilter !== "ALL" ||
    options.statusFilter !== "ALL" ||
    options.activeFilter !== "ALL"
  );
}
