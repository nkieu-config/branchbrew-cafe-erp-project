import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { Prisma } from '@prisma/client';
import {
  DEFAULT_BRANCH_MIN_STOCK,
  provisionBranchInventoryForBranch,
  provisionBranchInventoryForIngredient,
} from './branch-inventory-provision.helper';

describe('branch-inventory-provision.helper', () => {
  let db: DeepMockProxy<Pick<Prisma.TransactionClient, '$executeRaw'>>;

  beforeEach(() => {
    db = mockDeep();
  });

  describe('provisionBranchInventoryForBranch', () => {
    it('returns the number of rows inserted', async () => {
      db.$executeRaw.mockResolvedValue(2);

      const created = await provisionBranchInventoryForBranch(db, 10);

      expect(created).toBe(2);
      expect(db.$executeRaw).toHaveBeenCalledTimes(1);
    });

    it('returns 0 when nothing was inserted', async () => {
      db.$executeRaw.mockResolvedValue(0);

      const created = await provisionBranchInventoryForBranch(db, 10);

      expect(created).toBe(0);
    });

    it('passes custom minStock into the insert query', async () => {
      db.$executeRaw.mockResolvedValue(1);

      await provisionBranchInventoryForBranch(db, 10, 50);

      const callArgs = db.$executeRaw.mock.calls[0] as unknown[];
      expect(callArgs).toContain(10);
      expect(callArgs).toContain(50);
    });
  });

  describe('provisionBranchInventoryForIngredient', () => {
    it('returns the number of rows inserted', async () => {
      db.$executeRaw.mockResolvedValue(1);

      const created = await provisionBranchInventoryForIngredient(db, 5);

      expect(created).toBe(1);
      expect(db.$executeRaw).toHaveBeenCalledTimes(1);
    });

    it('uses default min stock', async () => {
      db.$executeRaw.mockResolvedValue(3);

      await provisionBranchInventoryForIngredient(db, 5);

      const callArgs = db.$executeRaw.mock.calls[0] as unknown[];
      expect(callArgs).toContain(5);
      expect(callArgs).toContain(DEFAULT_BRANCH_MIN_STOCK);
    });
  });
});
