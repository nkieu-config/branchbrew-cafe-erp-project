import { useMemo } from "react";
import { useProducts } from "@/hooks/domains/useProductQueries";
import { summarizeFoodCost } from "@/lib/food-cost-filters";
import { productIsActive } from "@/lib/menu-product-filters";

export function useProductsSummary() {
  const query = useProducts();
  const products = query.data ?? [];

  const summary = useMemo(() => {
    const foodCost = summarizeFoodCost(products);
    let active = 0;
    let inactive = 0;
    for (const product of products) {
      if (productIsActive(product)) active += 1;
      else inactive += 1;
    }
    return {
      total: products.length,
      active,
      inactive,
      foodCost,
    };
  }, [products]);

  return {
    ...query,
    products,
    summary,
  };
}
