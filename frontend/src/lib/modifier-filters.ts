import type { ModifierGroup } from "@/types/api";

export type ModifierCategoryFilter = "ALL" | string;
export type ModifierHighlightFilter = "ALL" | "empty" | "with-swap";

export function modifierGroupIsEmpty(group: ModifierGroup): boolean {
  return (group.options?.length ?? 0) === 0;
}

export function modifierGroupHasSwap(group: ModifierGroup): boolean {
  return group.swapIngredientId != null || group.swapIngredient != null;
}

export function countModifierOptions(groups: ModifierGroup[]): number {
  return groups.reduce((sum, group) => sum + (group.options?.length ?? 0), 0);
}

export function matchesModifierCategoryFilter(
  group: ModifierGroup,
  filter: ModifierCategoryFilter,
): boolean {
  if (filter === "ALL") return true;
  if (!group.category) return true;
  return group.category === filter;
}

export function matchesModifierSearch(group: ModifierGroup, search: string): boolean {
  if (!search) return true;
  const haystack = [
    group.name,
    group.category ?? "",
    ...group.options.map((option) => option.name),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(search);
}

export function matchesModifierHighlightFilter(
  group: ModifierGroup,
  filter: ModifierHighlightFilter,
): boolean {
  if (filter === "ALL") return true;
  if (filter === "empty") return modifierGroupIsEmpty(group);
  if (filter === "with-swap") return modifierGroupHasSwap(group);
  return true;
}

export function buildModifierCategoryOptions(
  groups: ModifierGroup[],
  productCategories: string[],
): string[] {
  const set = new Set<string>();
  for (const cat of productCategories) {
    if (cat) set.add(cat);
  }
  for (const group of groups) {
    if (group.category) set.add(group.category);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
