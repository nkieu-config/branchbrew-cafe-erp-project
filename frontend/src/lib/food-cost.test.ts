import { toNumber } from './money';
import { calcProductFoodCost, foodCostStatus } from './food-cost';
import type { Product, RecipeItem, Ingredient } from '@/types/api';

describe('food-cost', () => {
  it('computes food cost percent from recipe', () => {
    const product = {
      id: 1,
      name: 'Latte',
      price: 85,
      category: 'Coffee',
      recipeItems: [
        { id: 1, productId: 1, ingredientId: 1, quantity: 18, ingredient: { id: 1, name: 'Beans', unit: 'g', costPerUnit: 0.5 } },
        { id: 2, productId: 1, ingredientId: 2, quantity: 150, ingredient: { id: 2, name: 'Milk', unit: 'ml', costPerUnit: 0.05 } },
      ] as (RecipeItem & { ingredient: Ingredient })[],
    } satisfies Product & { recipeItems: (RecipeItem & { ingredient: Ingredient })[] };

    const { foodCostPercent } = calcProductFoodCost(product);
    expect(foodCostPercent).toBeGreaterThan(0);
    expect(foodCostPercent).toBeLessThan(100);
    expect(foodCostStatus(25)).toBe('good');
    expect(foodCostStatus(35)).toBe('warn');
    expect(foodCostStatus(45)).toBe('bad');
  });
});
