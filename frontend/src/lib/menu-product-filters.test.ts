import { describe, expect, it } from "vitest";
import type { Product } from "@/types/api";
import {
  matchesMenuStatusFilter,
  productHasRecipe,
  productIsActive,
  filterMenuProducts,
} from "./menu-product-filters";

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    name: "Latte",
    price: 100,
    category: "Coffee",
    isActive: true,
    recipeItems: [],
    ...overrides,
  };
}

describe("menu-product-filters", () => {
  it("detects active/inactive products", () => {
    expect(productIsActive(product())).toBe(true);
    expect(productIsActive(product({ isActive: false }))).toBe(false);
  });

  it("detects missing recipes", () => {
    expect(productHasRecipe(product())).toBe(false);
    expect(
      productHasRecipe(
        product({ recipeItems: [{ id: 1, productId: 1, ingredientId: 2, quantity: 1 }] }),
      ),
    ).toBe(true);
  });

  it("filters by status", () => {
    expect(matchesMenuStatusFilter(product(), "active")).toBe(true);
    expect(matchesMenuStatusFilter(product({ isActive: false }), "active")).toBe(false);
  });

  it("filters products by search, category, and status", () => {
    const products = [
      product({ id: 1, name: "Latte", category: "Coffee" }),
      product({ id: 2, name: "Tea", category: "Tea", isActive: false }),
    ];
    expect(
      filterMenuProducts(products, {
        search: "latte",
        categoryFilter: "ALL",
        statusFilter: "ALL",
      }),
    ).toHaveLength(1);
    expect(
      filterMenuProducts(products, {
        search: "",
        categoryFilter: "Tea",
        statusFilter: "inactive",
      }),
    ).toHaveLength(1);
  });
});
