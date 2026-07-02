import { Prisma } from '@prisma/client';

export const PO_NUMBER_PAD = 6;
export const MAX_PO_NUMBER_RETRIES = 3;

type DbClient = Pick<Prisma.TransactionClient, '$queryRaw'>;

export function formatPoNumber(seq: number, prefix = 'PO'): string {
  return `${prefix}-${String(seq).padStart(PO_NUMBER_PAD, '0')}`;
}

/**
 * Allocates the next purchase-order number from a Postgres sequence.
 * Must run inside the same transaction as PO creation.
 */
export async function allocatePoNumber(
  db: DbClient,
  prefix = 'PO',
): Promise<string> {
  const rows = await db.$queryRaw<[{ nextval: bigint }]>`
    SELECT nextval('purchase_order_number_seq') AS nextval
  `;
  const seq = Number(rows[0].nextval);
  return formatPoNumber(seq, prefix);
}

export function isPoNumberConflict(err: unknown): boolean {
  if (
    !(err instanceof Prisma.PrismaClientKnownRequestError) ||
    err.code !== 'P2002'
  ) {
    return false;
  }

  const target = err.meta?.target;
  return Array.isArray(target) && target.includes('poNumber');
}
