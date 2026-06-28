import { describe, expect, it } from "vitest";
import {
  buildProductsCostingUrl,
  buildProductsIngredientsUrl,
  parseProductsCostingSearchParams,
  parseProductsIngredientsSearchParams,
} from "./products-hub-url";

describe("products-hub-url", () => {
  it("builds costing URLs with query params", () => {
    expect(buildProductsCostingUrl()).toBe("/products/costing");
    expect(buildProductsCostingUrl({ status: "bad", category: "Coffee" })).toBe(
      "/products/costing?status=bad&category=Coffee",
    );
  });

  it("parses costing search params", () => {
    const params = new URLSearchParams("status=bad&category=Coffee");
    expect(parseProductsCostingSearchParams(params)).toEqual({
      status: "bad",
      category: "Coffee",
    });
    expect(parseProductsCostingSearchParams(new URLSearchParams())).toEqual({
      status: "ALL",
      category: "ALL",
    });
  });

  it("builds and parses ingredients URLs", () => {
    expect(buildProductsIngredientsUrl({ cost: "missing-cost" })).toBe(
      "/products/ingredients?cost=missing-cost",
    );
    expect(
      parseProductsIngredientsSearchParams(new URLSearchParams("cost=missing-cost")),
    ).toEqual({ cost: "missing-cost" });
  });
});
