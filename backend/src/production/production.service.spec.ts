import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ProductionService } from './production.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  MockPrismaService,
  PrismaServiceMockProvider,
} from '../prisma/prisma.service.mock';
import { OutboxService } from '../outbox/outbox.service';

describe('ProductionService', () => {
  let service: ProductionService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionService,
        PrismaServiceMockProvider,
        {
          provide: OutboxService,
          useValue: { enqueue: jest.fn().mockResolvedValue({ id: 1 }) },
        },
      ],
    }).compile();

    service = module.get(ProductionService);
    prisma = module.get(PrismaService);
  });

  it('rejects direct completion through generic status updates', async () => {
    await expect(
      service.updateOrderStatus(1, 'COMPLETED', {
        userId: 1,
        role: 'MANAGER',
        branchId: 2,
      }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.productionOrder.findUnique).not.toHaveBeenCalled();
  });

  it('rejects production orders on branches that are not central kitchens', async () => {
    prisma.branch.findUnique.mockResolvedValue({
      id: 2,
      isCentralKitchen: false,
    } as any);

    await expect(
      service.createProductionOrder({
        branchId: 2,
        targetIngredientId: 7,
        quantityToProduce: 100,
      }),
    ).rejects.toThrow('Branch is not a central kitchen');
  });

  describe('completeProductionOrder', () => {
    const plannedOrder = {
      id: 10,
      orderNumber: 'PRD-1',
      branchId: 3,
      targetIngredientId: 7,
      quantityToProduce: 100,
      status: 'PLANNED',
      targetIngredient: { id: 7, name: 'Cold Brew Base', costPerUnit: 0.12 },
    };

    beforeEach(() => {
      prisma.$transaction.mockImplementation(async (cb: Function) =>
        cb(prisma),
      );
    });

    it('throws when the order is already completed', async () => {
      prisma.productionOrder.findUnique.mockResolvedValue({
        ...plannedOrder,
        status: 'COMPLETED',
      } as any);

      await expect(service.completeProductionOrder(10)).rejects.toThrow(
        'Order already completed',
      );
    });

    it('throws when the target ingredient has no BOM', async () => {
      prisma.productionOrder.findUnique.mockResolvedValue(plannedOrder as any);
      prisma.productionBOM.findMany.mockResolvedValue([]);

      await expect(service.completeProductionOrder(10)).rejects.toThrow(
        'No BOM found for this ingredient',
      );
    });

    it('consumes raw batches, creates a finished-goods batch, and reports standard cost', async () => {
      prisma.productionOrder.findUnique.mockResolvedValue(plannedOrder as any);
      prisma.productionBOM.findMany.mockResolvedValue([
        {
          rawIngredientId: 5,
          quantityNeeded: 0.5,
          rawIngredient: { id: 5, name: 'Beans', costPerUnit: 0.1 },
        },
      ] as any);

      prisma.branchInventory.findUnique
        .mockResolvedValueOnce({
          id: 1,
          branchId: 3,
          ingredientId: 5,
          stock: 100,
          ingredient: { name: 'Beans' },
        } as any)
        .mockResolvedValueOnce(null);
      prisma.branchInventory.updateMany.mockResolvedValue({ count: 1 });
      prisma.inventoryBatch.findMany.mockResolvedValue([
        { id: 20, quantity: 100, status: 'ACTIVE' },
      ] as any);
      prisma.inventoryBatch.updateMany.mockResolvedValue({ count: 1 });
      prisma.productionOrder.update.mockResolvedValue({
        ...plannedOrder,
        status: 'COMPLETED',
      } as any);

      const outbox = (service as any).outboxService as {
        enqueue: jest.Mock;
      };

      await service.completeProductionOrder(10, 1);

      expect(prisma.productionOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'COMPLETED',
            actualCost: 5,
          }),
        }),
      );
      expect(prisma.inventoryBatch.create).toHaveBeenCalledWith({
        data: {
          branchId: 3,
          ingredientId: 7,
          quantity: 100,
          status: 'ACTIVE',
        },
      });
      expect(outbox.enqueue).toHaveBeenCalledTimes(1);
      const [, eventType, payload] = outbox.enqueue.mock.calls[0];
      expect(eventType).toBe('production.completed');
      expect(payload.production).toMatchObject({
        totalRawCost: 5,
        finishedGoodsValue: 12,
      });
    });
  });
});
