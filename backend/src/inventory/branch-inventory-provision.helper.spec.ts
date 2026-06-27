import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { Prisma } from '@prisma/client';
import {
  DEFAULT_BRANCH_MIN_STOCK,
  provisionBranchInventoryForBranch,
  provisionBranchInventoryForIngredient,
} from './branch-inventory-provision.helper';

describe('branch-inventory-provision.helper', () => {
  let db: DeepMockProxy<{
    ingredient: Prisma.TransactionClient['ingredient'];
    branch: Prisma.TransactionClient['branch'];
    branchInventory: Prisma.TransactionClient['branchInventory'];
  }>;

  beforeEach(() => {
    db = mockDeep();
  });

  describe('provisionBranchInventoryForBranch', () => {
    it('creates rows for ingredients missing at the branch', async () => {
      db.ingredient.findMany.mockResolvedValue([
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ] as any);
      db.branchInventory.findMany.mockResolvedValue([
        { ingredientId: 2 },
      ] as any);
      db.branchInventory.createMany.mockResolvedValue({ count: 2 });

      const created = await provisionBranchInventoryForBranch(db, 10);

      expect(created).toBe(2);
      expect(db.branchInventory.createMany).toHaveBeenCalledWith({
        data: [
          {
            branchId: 10,
            ingredientId: 1,
            stock: 0,
            minStock: DEFAULT_BRANCH_MIN_STOCK,
          },
          {
            branchId: 10,
            ingredientId: 3,
            stock: 0,
            minStock: DEFAULT_BRANCH_MIN_STOCK,
          },
        ],
      });
    });

    it('returns 0 when all ingredients already exist', async () => {
      db.ingredient.findMany.mockResolvedValue([{ id: 1 }] as any);
      db.branchInventory.findMany.mockResolvedValue([
        { ingredientId: 1 },
      ] as any);

      const created = await provisionBranchInventoryForBranch(db, 10);

      expect(created).toBe(0);
      expect(db.branchInventory.createMany).not.toHaveBeenCalled();
    });
  });

  describe('provisionBranchInventoryForIngredient', () => {
    it('creates rows for branches missing the ingredient', async () => {
      db.branch.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }] as any);
      db.branchInventory.findMany.mockResolvedValue([{ branchId: 1 }] as any);
      db.branchInventory.createMany.mockResolvedValue({ count: 1 });

      const created = await provisionBranchInventoryForIngredient(db, 5);

      expect(created).toBe(1);
      expect(db.branchInventory.createMany).toHaveBeenCalledWith({
        data: [
          {
            branchId: 2,
            ingredientId: 5,
            stock: 0,
            minStock: DEFAULT_BRANCH_MIN_STOCK,
          },
        ],
      });
    });
  });
});
