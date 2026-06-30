import { Prisma } from '@prisma/client';

/** Cafe business day timezone for daily queue reset. */
export const QUEUE_TIMEZONE = process.env.BUSINESS_TIMEZONE ?? 'UTC';

type DbClient = {
  order: Prisma.TransactionClient['order'];
};

/** YYYY-MM-DD in the configured business-day timezone. */
export function getQueueBusinessDateString(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: QUEUE_TIMEZONE,
  }).format(now);
}

/** Date-only value stored on Order.queueDate (UTC midnight of YYYY-MM-DD). */
export function parseQueueBusinessDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

export function formatQueueNumberDisplay(
  queueNumber: number | null | undefined,
): string {
  if (queueNumber == null || queueNumber <= 0) return '—';
  return String(queueNumber).padStart(3, '0');
}

/**
 * Allocates the next queue number for a branch on the current business day.
 * Must run inside the same transaction as order creation.
 */
export async function allocateQueueNumber(
  db: DbClient,
  branchId: number,
  now = new Date(),
): Promise<{ queueNumber: number; queueDate: Date }> {
  const dateStr = getQueueBusinessDateString(now);
  const queueDate = parseQueueBusinessDate(dateStr);

  const last = await db.order.findFirst({
    where: { branchId, queueDate },
    orderBy: { queueNumber: 'desc' },
    select: { queueNumber: true },
  });

  return {
    queueNumber: (last?.queueNumber ?? 0) + 1,
    queueDate,
  };
}
