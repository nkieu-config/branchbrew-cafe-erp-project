import { InventoryBatchExpiryProcessor } from './inventory-batch-expiry.processor';
import { PrismaService } from '../prisma/prisma.service';

describe('InventoryBatchExpiryProcessor', () => {
  it('marks active batches past expiry as EXPIRED', async () => {
    const prisma = {
      inventoryBatch: {
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    } as unknown as PrismaService;

    const processor = new InventoryBatchExpiryProcessor(prisma);
    await processor.markExpiredBatches();

    expect(prisma.inventoryBatch.updateMany).toHaveBeenCalledWith({
      where: {
        status: 'ACTIVE',
        expiryDate: { not: null, lt: expect.any(Date) },
        quantity: { gt: 0 },
      },
      data: { status: 'EXPIRED' },
    });
  });
});
