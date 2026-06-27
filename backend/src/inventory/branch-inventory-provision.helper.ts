import { Prisma } from '@prisma/client';

/** Default reorder alert threshold for newly provisioned branch–ingredient rows. */
export const DEFAULT_BRANCH_MIN_STOCK = 100;

type ProvisionDb = Pick<Prisma.TransactionClient, '$executeRaw'>;

/**
 * Creates BranchInventory rows (stock 0) for every ingredient missing at a branch.
 * Idempotent — skips existing pairs. Uses INSERT…SELECT so ingredient IDs are read
 * and inserted in one statement (safe under parallel e2e workers).
 */
export async function provisionBranchInventoryForBranch(
  db: ProvisionDb,
  branchId: number,
  minStock = DEFAULT_BRANCH_MIN_STOCK,
): Promise<number> {
  const inserted = await db.$executeRaw`
    INSERT INTO "BranchInventory" ("branchId", "ingredientId", "stock", "minStock")
    SELECT ${branchId}, i.id, 0, ${minStock}
    FROM "Ingredient" i
    WHERE NOT EXISTS (
      SELECT 1
      FROM "BranchInventory" bi
      WHERE bi."branchId" = ${branchId}
        AND bi."ingredientId" = i.id
    )
  `;

  return Number(inserted);
}

/**
 * Creates BranchInventory rows (stock 0) for every branch missing a given ingredient.
 * Idempotent — skips existing pairs.
 */
export async function provisionBranchInventoryForIngredient(
  db: ProvisionDb,
  ingredientId: number,
  minStock = DEFAULT_BRANCH_MIN_STOCK,
): Promise<number> {
  const inserted = await db.$executeRaw`
    INSERT INTO "BranchInventory" ("branchId", "ingredientId", "stock", "minStock")
    SELECT b.id, ${ingredientId}, 0, ${minStock}
    FROM "Branch" b
    WHERE EXISTS (
      SELECT 1 FROM "Ingredient" i WHERE i.id = ${ingredientId}
    )
    AND NOT EXISTS (
      SELECT 1
      FROM "BranchInventory" bi
      WHERE bi."branchId" = b.id
        AND bi."ingredientId" = ${ingredientId}
    )
  `;

  return Number(inserted);
}
