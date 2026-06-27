import { Prisma } from '@prisma/client';

/** Default reorder alert threshold for newly provisioned branch–ingredient rows. */
export const DEFAULT_BRANCH_MIN_STOCK = 100;

type DbClient =
  | Prisma.TransactionClient
  | {
      ingredient: Prisma.TransactionClient['ingredient'];
      branch: Prisma.TransactionClient['branch'];
      branchInventory: Prisma.TransactionClient['branchInventory'];
    };

/**
 * Creates BranchInventory rows (stock 0) for every ingredient missing at a branch.
 * Idempotent — skips existing pairs.
 */
export async function provisionBranchInventoryForBranch(
  db: DbClient,
  branchId: number,
  minStock = DEFAULT_BRANCH_MIN_STOCK,
): Promise<number> {
  const ingredients = await db.ingredient.findMany({ select: { id: true } });
  if (ingredients.length === 0) return 0;

  const existing = await db.branchInventory.findMany({
    where: { branchId },
    select: { ingredientId: true },
  });
  const existingIds = new Set(existing.map((row) => row.ingredientId));

  const missing = ingredients.filter((i) => !existingIds.has(i.id));
  if (missing.length === 0) return 0;

  await db.branchInventory.createMany({
    data: missing.map((ingredient) => ({
      branchId,
      ingredientId: ingredient.id,
      stock: 0,
      minStock,
    })),
  });

  return missing.length;
}

/**
 * Creates BranchInventory rows (stock 0) for every branch missing a given ingredient.
 * Idempotent — skips existing pairs.
 */
export async function provisionBranchInventoryForIngredient(
  db: DbClient,
  ingredientId: number,
  minStock = DEFAULT_BRANCH_MIN_STOCK,
): Promise<number> {
  const branches = await db.branch.findMany({ select: { id: true } });
  if (branches.length === 0) return 0;

  const existing = await db.branchInventory.findMany({
    where: { ingredientId },
    select: { branchId: true },
  });
  const existingBranchIds = new Set(existing.map((row) => row.branchId));

  const missing = branches.filter((b) => !existingBranchIds.has(b.id));
  if (missing.length === 0) return 0;

  await db.branchInventory.createMany({
    data: missing.map((branch) => ({
      branchId: branch.id,
      ingredientId,
      stock: 0,
      minStock,
    })),
  });

  return missing.length;
}
