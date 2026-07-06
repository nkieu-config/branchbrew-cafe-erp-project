import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { StockCountService } from './stock-count.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  MockPrismaService,
  PrismaServiceMockProvider,
} from '../prisma/prisma.service.mock';
import { OutboxService } from '../outbox/outbox.service';
import { NotificationsService } from '../notifications/notifications.service';

const manager = { userId: 1, role: 'MANAGER', branchId: 2 } as const;

describe('StockCountService', () => {
  let service: StockCountService;
  let prisma: MockPrismaService;
  let outbox: { enqueue: jest.Mock };

  beforeEach(async () => {
    outbox = { enqueue: jest.fn().mockResolvedValue({ id: 1 }) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockCountService,
        PrismaServiceMockProvider,
        { provide: OutboxService, useValue: outbox },
        {
          provide: NotificationsService,
          useValue: { notifyBranch: jest.fn(), notifyUser: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(StockCountService);
    prisma = module.get(PrismaService);
  });

  it('rejects starting a count when the branch has no inventory', async () => {
    prisma.branchInventory.findMany.mockResolvedValue([]);

    await expect(service.createStockCount(2, manager, {})).rejects.toThrow(
      'No inventory to count at this branch.',
    );

    expect(prisma.stockCount.create).not.toHaveBeenCalled();
  });

  it('rejects editing lines once the count is submitted', async () => {
    prisma.stockCount.findUnique.mockResolvedValue({
      id: 5,
      branchId: 2,
      status: 'SUBMITTED',
    } as any);

    await expect(
      service.updateLines(5, manager, {
        lines: [{ ingredientId: 3, countedQty: 10 }],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects submitting when nothing was counted', async () => {
    prisma.$transaction.mockImplementation(async (cb: Function) => cb(prisma));
    prisma.stockCount.findUnique.mockResolvedValue({
      id: 5,
      branchId: 2,
      status: 'DRAFT',
      lines: [{ id: 1, ingredientId: 3, countedQty: null }],
    } as any);

    await expect(service.submit(5, manager)).rejects.toThrow(
      'Enter at least one counted quantity before submitting.',
    );
  });

  describe('approve', () => {
    beforeEach(() => {
      prisma.$transaction.mockImplementation(async (cb: Function) =>
        cb(prisma),
      );
    });

    it('applies variances, records adjustments, and enqueues the GL event', async () => {
      const submittedCount = {
        id: 7,
        branchId: 2,
        status: 'SUBMITTED',
        isBlind: false,
        lines: [
          {
            id: 1,
            ingredientId: 3,
            expectedQty: 100,
            countedQty: 90,
            ingredient: { id: 3, name: 'Beans', costPerUnit: 2 },
          },
          {
            id: 2,
            ingredientId: 4,
            expectedQty: 50,
            countedQty: 50,
            ingredient: { id: 4, name: 'Milk', costPerUnit: 1 },
          },
        ],
      };
      prisma.stockCount.findUnique.mockResolvedValue(submittedCount as any);
      prisma.stockCount.updateMany.mockResolvedValue({ count: 1 });

      prisma.branchInventory.findUnique.mockResolvedValue({
        id: 11,
        branchId: 2,
        ingredientId: 3,
        stock: 95,
        ingredient: { name: 'Beans' },
      } as any);
      prisma.branchInventory.updateMany.mockResolvedValue({ count: 1 });
      prisma.inventoryBatch.findMany.mockResolvedValue([
        { id: 20, quantity: 95, status: 'ACTIVE' },
      ] as any);
      prisma.inventoryBatch.updateMany.mockResolvedValue({ count: 1 });
      prisma.branchInventory.findMany.mockResolvedValue([]);

      await service.approve(7, manager);

      expect(prisma.stockAdjustment.create).toHaveBeenCalledTimes(1);
      expect(prisma.stockAdjustment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ingredientId: 3,
          quantityDelta: -10,
          reason: 'COUNT_VARIANCE',
          stockCountId: 7,
        }),
      });

      expect(outbox.enqueue).toHaveBeenCalledTimes(1);
      const [, eventType, payload] = outbox.enqueue.mock.calls[0];
      expect(eventType).toBe('inventory.stock-adjusted');
      expect(payload.adjustment).toMatchObject({
        reference: 'STOCKCOUNT-7',
        branchId: 2,
        netVarianceValue: -20,
      });
    });

    it('skips the GL event when counted matches expected', async () => {
      prisma.stockCount.findUnique.mockResolvedValue({
        id: 8,
        branchId: 2,
        status: 'SUBMITTED',
        lines: [
          {
            id: 1,
            ingredientId: 3,
            expectedQty: 100,
            countedQty: 100,
            ingredient: { id: 3, name: 'Beans', costPerUnit: 2 },
          },
        ],
      } as any);
      prisma.stockCount.updateMany.mockResolvedValue({ count: 1 });
      prisma.branchInventory.findMany.mockResolvedValue([]);

      await service.approve(8, manager);

      expect(prisma.stockAdjustment.create).not.toHaveBeenCalled();
      expect(outbox.enqueue).not.toHaveBeenCalled();
    });

    it('rejects approving a count that is not submitted', async () => {
      prisma.stockCount.findUnique.mockResolvedValue({
        id: 9,
        branchId: 2,
        status: 'APPROVED',
        lines: [],
      } as any);

      await expect(service.approve(9, manager)).rejects.toThrow(
        'Only submitted stock counts can be approved.',
      );
    });
  });

  it('rejects a zero-quantity manual adjustment', async () => {
    await expect(
      service.createManualAdjustment(2, manager, {
        ingredientId: 3,
        quantityDelta: 0,
        reason: 'CORRECTION',
      }),
    ).rejects.toThrow('Adjustment quantity cannot be zero.');
  });
});
