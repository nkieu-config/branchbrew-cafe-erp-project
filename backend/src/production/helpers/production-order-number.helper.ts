import { Prisma } from '@prisma/client';

export const PRODUCTION_ORDER_NUMBER_PAD = 6;
export const MAX_PRODUCTION_ORDER_NUMBER_RETRIES = 3;

type DbClient = Pick<Prisma.TransactionClient, '$queryRaw'>;

export function formatProductionOrderNumber(
  seq: number,
  prefix = 'PRD',
): string {
  return `${prefix}-${String(seq).padStart(PRODUCTION_ORDER_NUMBER_PAD, '0')}`;
}

export async function allocateProductionOrderNumber(
  db: DbClient,
  prefix = 'PRD',
): Promise<string> {
  const rows = await db.$queryRaw<[{ nextval: bigint }]>`
    SELECT nextval('production_order_number_seq') AS nextval
  `;
  const seq = Number(rows[0].nextval);
  return formatProductionOrderNumber(seq, prefix);
}

export function isProductionOrderNumberConflict(err: unknown): boolean {
  if (
    !(err instanceof Prisma.PrismaClientKnownRequestError) ||
    err.code !== 'P2002'
  ) {
    return false;
  }

  const target = err.meta?.target;
  return Array.isArray(target) && target.includes('orderNumber');
}
