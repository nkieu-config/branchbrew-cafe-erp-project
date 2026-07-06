import type { BomGroupRow, ProductionBOM } from "@/types/api";

export function summarizeProductionBoms(groups: BomGroupRow[]) {
  let rawLines = 0;
  let missingCostLines = 0;
  let totalCost = 0;

  for (const group of groups) {
    rawLines += group.children.length;
    for (const child of group.children) {
      totalCost += child.totalCost;
      if (child.costPerUnit <= 0) missingCostLines += 1;
    }
  }

  return {
    targets: groups.length,
    rawLines,
    missingCostLines,
    totalCost,
  };
}

export function productionBomHasTarget(
  boms: ProductionBOM[],
  targetIngredientId: number,
): boolean {
  return boms.some((bom) => bom.targetIngredientId === targetIngredientId);
}

export function getBomTargetIds(boms: ProductionBOM[]): Set<number> {
  return new Set(boms.map((bom) => bom.targetIngredientId));
}

export function matchesBomSearch(group: BomGroupRow, search: string): boolean {
  if (!search) return true;
  const haystack = [
    group.targetName,
    group.targetUnit,
    ...group.children.map((child) => child.rawName),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(search);
}

export function bomGroupHasMissingCost(group: BomGroupRow): boolean {
  return group.children.some((child) => child.costPerUnit <= 0);
}
