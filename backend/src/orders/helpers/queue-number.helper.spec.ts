import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { Prisma } from '@prisma/client';
import {
  allocateQueueNumber,
  formatQueueNumberDisplay,
  getQueueBusinessDateString,
  parseQueueBusinessDate,
} from './queue-number.helper';

describe('queue-number.helper', () => {
  let db: DeepMockProxy<{ order: Prisma.TransactionClient['order'] }>;

  beforeEach(() => {
    db = mockDeep();
  });

  it('formats queue numbers with zero padding', () => {
    expect(formatQueueNumberDisplay(7)).toBe('007');
    expect(formatQueueNumberDisplay(null)).toBe('—');
  });

  it('parses business date string', () => {
    expect(parseQueueBusinessDate('2026-06-27').toISOString()).toBe(
      '2026-06-27T00:00:00.000Z',
    );
  });

  it('allocates first queue number of the day', async () => {
    db.order.findFirst.mockResolvedValue(null);

    const result = await allocateQueueNumber(db, 1);

    expect(result.queueNumber).toBe(1);
    expect(getQueueBusinessDateString(result.queueDate)).toBe(
      getQueueBusinessDateString(),
    );
  });

  it('increments from the latest queue number', async () => {
    db.order.findFirst.mockResolvedValue({ queueNumber: 41 } as any);

    const result = await allocateQueueNumber(db, 2);

    expect(result.queueNumber).toBe(42);
  });
});
