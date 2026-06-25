import { describe, it, expect } from 'vitest';
import { groupProductionBoms } from './bom';
import type { ProductionBOM } from '@/types/api';

const bom: ProductionBOM = {
  id: 1,
  targetIngredientId: 10,
  rawIngredientId: 20,
  quantityNeeded: 2,
  targetIngredient: { id: 10, name: 'Espresso', unit: 'shot' },
  rawIngredient: { id: 20, name: 'Beans', unit: 'g', costPerUnit: 0.5 },
};

describe('groupProductionBoms', () => {
  it('groups rows by target ingredient', () => {
    const grouped = groupProductionBoms([bom]);
    expect(grouped).toHaveLength(1);
    expect(grouped[0].targetName).toBe('Espresso');
    expect(grouped[0].children).toHaveLength(1);
    expect(grouped[0].children[0].totalCost).toBe(1);
  });
});
