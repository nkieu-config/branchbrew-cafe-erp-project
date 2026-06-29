"use client";

import type { ModifierGroup } from "@/types/api";
import { toNumber } from "@/lib/money";

export function getModifierSummary(
  groups: ModifierGroup[],
  picks: Record<number, number>,
): string {
  return groups
    .map((g) => {
      const opt = g.options.find((o) => o.id === picks[g.id]);
      return opt ? `${g.name}: ${opt.name}` : null;
    })
    .filter(Boolean)
    .join(", ");
}

export function getModifierExtra(
  groups: ModifierGroup[],
  picks: Record<number, number>,
): number {
  return groups.reduce((sum, g) => {
    const opt = g.options.find((o) => o.id === picks[g.id]);
    return sum + (opt ? toNumber(opt.priceDelta) : 0);
  }, 0);
}

export function resolveModifierCategory(productCategory: string | undefined): string | undefined {
  const cat = productCategory?.toLowerCase() ?? "";
  if (cat.includes("coffee")) return "Coffee";
  if (cat.includes("beverage")) return "Beverage";
  return undefined;
}

export function productNeedsModifiers(product: { category: string }): boolean {
  const cat = product.category.toLowerCase();
  return cat.includes("coffee") || cat.includes("beverage");
}
