import type { FoodCostStatusFilter } from "@/lib/food-cost-filters";
import type { IngredientCostFilter } from "@/lib/ingredient-filters";

const FOOD_COST_STATUS_PARAMS: FoodCostStatusFilter[] = [
  "good",
  "warn",
  "bad",
  "no-recipe",
  "missing-cost",
];

export type ProductsCostingQuery = {
  status?: Exclude<FoodCostStatusFilter, "ALL">;
  category?: string;
};

export type ProductsIngredientsQuery = {
  cost?: Exclude<IngredientCostFilter, "ALL">;
};

export function buildProductsCostingUrl(query?: ProductsCostingQuery): string {
  const params = new URLSearchParams();
  if (query?.status) params.set("status", query.status);
  if (query?.category) params.set("category", query.category);
  const qs = params.toString();
  return qs ? `/products/costing?${qs}` : "/products/costing";
}

export function parseProductsCostingSearchParams(searchParams: URLSearchParams): {
  status: FoodCostStatusFilter;
  category: string;
} {
  const rawStatus = searchParams.get("status");
  const status = FOOD_COST_STATUS_PARAMS.includes(rawStatus as FoodCostStatusFilter)
    ? (rawStatus as FoodCostStatusFilter)
    : "ALL";
  const category = searchParams.get("category") ?? "ALL";
  return { status, category };
}

export function buildProductsIngredientsUrl(query?: ProductsIngredientsQuery): string {
  const params = new URLSearchParams();
  if (query?.cost) params.set("cost", query.cost);
  const qs = params.toString();
  return qs ? `/products/ingredients?${qs}` : "/products/ingredients";
}

export function parseProductsIngredientsSearchParams(searchParams: URLSearchParams): {
  cost: IngredientCostFilter;
} {
  const rawCost = searchParams.get("cost");
  return {
    cost: rawCost === "missing-cost" ? "missing-cost" : "ALL",
  };
}
