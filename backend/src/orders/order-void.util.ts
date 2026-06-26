type RecipeRow = { ingredientId: number; quantity: number };
type OrderItemWithRecipe = {
  quantity: number;
  product: { recipeItems: RecipeRow[] };
};

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function buildIngredientRequirementsFromOrderItems(
  items: OrderItemWithRecipe[],
): Map<number, number> {
  const map = new Map<number, number>();
  for (const item of items) {
    for (const row of item.product.recipeItems) {
      const needed = row.quantity * item.quantity;
      map.set(row.ingredientId, (map.get(row.ingredientId) ?? 0) + needed);
    }
  }
  return map;
}
