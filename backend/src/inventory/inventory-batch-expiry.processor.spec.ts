import { InventoryBatchExpiryProcessor } from './inventory-batch-expiry.processor';
import { PrismaService } from '../prisma/prisma.service';

describe('InventoryBatchExpiryProcessor', () => {
  it('does nothing when no expired batches exist', async () => {
    const prisma = {
      inventoryBatch: { findMany: jest.fn().mockResolvedValue([]) },
      user: { findFirst: jest.fn() },
      $transaction: jest.fn(),
    } as unknown as PrismaService;

    const processor = new InventoryBatchExpiryProcessor(prisma);
    await processor.markExpiredBatches();

    expect(prisma.inventoryBatch.findMany).toHaveBeenCalled();
    expect(prisma.user.findFirst).not.toHaveBeenCalled();
  });

  it('skips auto-waste when no SUPER_ADMIN user exists', async () => {
    const prisma = {
      inventoryBatch: {
        findMany: jest.fn().mockResolvedValue([{ id: 1 }]),
      },
      user: { findFirst: jest.fn().mockResolvedValue(null) },
      $transaction: jest.fn(),
    } as unknown as PrismaService;

    const processor = new InventoryBatchExpiryProcessor(prisma);
    await processor.markExpiredBatches();

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('auto-disposes expired batches with waste log and stock deduction', async () => {
    const batchUpdate = jest.fn();
    const wasteCreate = jest.fn();
    const inventoryUpdate = jest.fn();

    const tx = {
      inventoryBatch: {
        findUnique: jest.fn().mockResolvedValue({
          id: 7,
          branchId: 2,
          ingredientId: 3,
          status: 'ACTIVE',
          quantity: 250,
        }),
        update: batchUpdate,
      },
      wasteLog: { create: wasteCreate },
      branchInventory: {
        findUnique: jest.fn().mockResolvedValue({ id: 9, stock: 3000 }),
        update: inventoryUpdate,
      },
    };

    const prisma = {
      inventoryBatch: {
        findMany: jest.fn().mockResolvedValue([{ id: 7 }]),
      },
      user: { findFirst: jest.fn().mockResolvedValue({ id: 1 }) },
      $transaction: jest.fn(async (fn) => fn(tx)),
    } as unknown as PrismaService;

    const processor = new InventoryBatchExpiryProcessor(prisma);
    await processor.markExpiredBatches();

    expect(wasteCreate).toHaveBeenCalledWith({
      data: {
        branchId: 2,
        ingredientId: 3,
        quantity: 250,
        reason: 'Auto-disposed: batch expired',
        recordedById: 1,
      },
    });
    expect(inventoryUpdate).toHaveBeenCalledWith({
      where: { id: 9 },
      data: { stock: 2750 },
    });
    expect(batchUpdate).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { status: 'EXPIRED', quantity: 0 },
    });
  });
});
