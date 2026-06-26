import { toNumber } from './money';
import type { Product, RecipeItem, Ingredient } from '@/types/api';

type RecipeWithIngredient = RecipeItem & { ingredient?: Ingredient };

export function calcProductFoodCost(
  product: Product & { recipeItems?: RecipeWithIngredient[] },
) {
  const items = product.recipeItems ?? [];
  const cost = items.reduce(
    (sum, row) =>
      sum + toNumber(row.quantity) * toNumber(row.ingredient?.costPerUnit),
    0,
  );
  const price = toNumber(product.price);
  const foodCostPercent = price > 0 ? (cost / price) * 100 : 0;
  return { cost, foodCostPercent };
}

export function foodCostStatus(percent: number): 'good' | 'warn' | 'bad' {
  if (percent <= 30) return 'good';
  if (percent <= 40) return 'warn';
  return 'bad';
}
