import { InventoryBatchExpiryProcessor } from './inventory-batch-expiry.processor';
import { PrismaService } from '../prisma/prisma.service';
import { WasteDisposalHelper } from './helpers/waste-disposal.helper';

jest.mock('./helpers/waste-disposal.helper', () => ({
  WasteDisposalHelper: {
    disposeBatchAsWaste: jest.fn(),
  },
}));

describe('InventoryBatchExpiryProcessor', () => {
  const mockedHelper = jest.mocked(WasteDisposalHelper);

  beforeEach(() => {
    jest.clearAllMocks();
  });

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
    expect(mockedHelper.disposeBatchAsWaste).not.toHaveBeenCalled();
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

  it('delegates each expired batch to WasteDisposalHelper', async () => {
    mockedHelper.disposeBatchAsWaste.mockResolvedValue({ id: 99 } as never);

    const tx = {};
    const prisma = {
      inventoryBatch: {
        findMany: jest.fn().mockResolvedValue([{ id: 7 }, { id: 8 }]),
      },
      user: { findFirst: jest.fn().mockResolvedValue({ id: 1 }) },
      $transaction: jest.fn(async (fn) => fn(tx)),
    } as unknown as PrismaService;

    const processor = new InventoryBatchExpiryProcessor(prisma);
    await processor.markExpiredBatches();

    expect(mockedHelper.disposeBatchAsWaste).toHaveBeenCalledTimes(2);
    expect(mockedHelper.disposeBatchAsWaste).toHaveBeenCalledWith(tx, {
      batchId: 7,
      userId: 1,
      reason: 'Auto-disposed: batch expired',
      batchStatus: 'EXPIRED',
      audit: {
        action: 'AUTO_WASTE',
        details: 'Auto-disposed expired batch #7',
      },
    });
  });
});
