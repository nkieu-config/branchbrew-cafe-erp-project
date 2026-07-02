import type { ProductionBOM, BomGroupRow } from '@/types/api';

export function groupProductionBoms(boms: ProductionBOM[]): BomGroupRow[] {
  const grouped = boms.reduce<Record<number, BomGroupRow>>((acc, bom) => {
    if (!bom.targetIngredient || !bom.rawIngredient) return acc;

    const targetId = bom.targetIngredientId;
    if (!acc[targetId]) {
      acc[targetId] = {
        id: `TARGET_${targetId}`,
        targetName: bom.targetIngredient.name,
        targetUnit: bom.targetIngredient.unit,
        isGroup: true,
        children: [],
      };
    }
    acc[targetId].children.push({
      id: bom.id,
      rawIngredientId: bom.rawIngredientId,
      rawName: bom.rawIngredient.name,
      rawUnit: bom.rawIngredient.unit,
      quantityNeeded: bom.quantityNeeded,
      costPerUnit: bom.rawIngredient.costPerUnit ?? 0,
      totalCost: bom.quantityNeeded * (bom.rawIngredient.costPerUnit ?? 0),
    });
    return acc;
  }, {});

  return Object.values(grouped);
}
