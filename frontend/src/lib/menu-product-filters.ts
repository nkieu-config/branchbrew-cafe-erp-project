import type { Product } from "@/types/api";

export type MenuStatusFilter = "ALL" | "active" | "inactive";

export function productIsActive(product: Product): boolean {
  return product.isActive !== false;
}

export function productHasRecipe(product: Product): boolean {
  return (product.recipeItems?.length ?? 0) > 0;
}

export function matchesMenuStatusFilter(
  product: Product,
  filter: MenuStatusFilter,
): boolean {
  if (filter === "ALL") return true;
  return filter === "active" ? productIsActive(product) : !productIsActive(product);
}
