import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { OrderCreationService } from './order-creation.service';
import { OrderLifecycleService } from './order-lifecycle.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { AppException } from '../common/errors/app.exception';
import {
  MockPrismaService,
  PrismaServiceMockProvider,
} from '../prisma/prisma.service.mock';
import { OutboxService } from '../outbox/outbox.service';
import { SettingsService } from '../settings/settings.service';
import { AuditService } from '../audit/audit.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: MockPrismaService;

  const TEST_BRANCH_ID = 2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        OrderCreationService,
        OrderLifecycleService,
        PrismaServiceMockProvider,
        {
          provide: OutboxService,
          useValue: { enqueue: jest.fn().mockResolvedValue({ id: 1 }) },
        },
        {
          provide: SettingsService,
          useValue: { getVatRatePercent: jest.fn().mockResolvedValue(7) },
        },
        {
          provide: AuditService,
          useValue: { logAction: jest.fn().mockResolvedValue({ id: 1 }) },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get(PrismaService);

    // Mock $transaction to simply yield the mocked prisma client
    prisma.$transaction.mockImplementation(async (cb: Function) => cb(prisma));
    prisma.order.findFirst.mockResolvedValue(null);
  });

  describe('createOrder', () => {
    const mockOrderData = {
      userId: 1,
      branchId: TEST_BRANCH_ID,
      items: [{ productId: 1, quantity: 2 }],
    };

    it('throws when product is not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.createOrder(mockOrderData)).rejects.toThrow(
        'Product with ID 1 not found',
      );
    });

    it('throws when stock is insufficient', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 1,
        name: 'Latte',
        price: 100,
        category: 'Coffee',
        categoryId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        recipeItems: [
          {
            id: 1,
            productId: 1,
            ingredientId: 1,
            quantity: 20, // Requires 20g
            ingredient: {
              id: 1,
              name: 'Coffee Beans',
              costPerUnit: 1,
              unit: 'g',
              minStock: 100,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        ],
      } as any);

      // Mock BranchInventory to have insufficient stock (needs 40g for 2 Lattes, only has 10g)
      prisma.branchInventory.findUnique.mockResolvedValue({
        id: 1,
        branchId: TEST_BRANCH_ID,
        ingredientId: 1,
        stock: 10,
        minStock: 50,
        updatedAt: new Date(),
        ingredient: {
          id: 1,
          name: 'Coffee Beans',
          costPerUnit: 1,
          unit: 'g',
          minStock: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any);

      await expect(service.createOrder(mockOrderData)).rejects.toThrow(
        new BadRequestException(
          'Not enough stock for Coffee Beans at this branch.',
        ),
      );
    });

    it('creates order and deducts stock', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 1,
        price: 100,
        category: 'Coffee',
        recipeItems: [
          {
            ingredientId: 1,
            quantity: 20, // 20g per item. We order 2 items, so 40g needed.
            ingredient: { costPerUnit: 1 }, // COGS = 40 * 1 = 40
          },
        ],
      } as any);

      prisma.branchInventory.findUnique.mockResolvedValue({
        id: 1,
        branchId: TEST_BRANCH_ID,
        ingredientId: 1,
        stock: 100, // Sufficient stock
      } as any);

      prisma.branchInventory.updateMany.mockResolvedValue({ count: 1 });
      prisma.inventoryBatch.updateMany.mockResolvedValue({ count: 1 });

      prisma.inventoryBatch.findMany.mockResolvedValue([
        { id: 1, quantity: 100, status: 'ACTIVE' },
      ] as any);

      prisma.order.create.mockResolvedValue({
        id: 1,
        totalAmount: 200,
        totalCogs: 40,
        netAmount: 200,
      } as any);

      const result = await service.createOrder(mockOrderData);

      expect(prisma.branchInventory.updateMany).toHaveBeenCalledWith({
        where: { id: 1, stock: { gte: 40 } },
        data: { stock: { decrement: 40 } },
      });

      expect(prisma.inventoryBatch.updateMany).toHaveBeenCalledWith({
        where: { id: 1, quantity: { gte: 40 } },
        data: { quantity: { decrement: 40 } },
      });

      expect(prisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalAmount: 200,
            totalCogs: 40,
            netAmount: 200,
            status: 'PENDING',
            queueNumber: 1,
            queueDate: expect.any(Date),
          }),
        }),
      );

      expect(result).toBeDefined();
    });

    it('throws when promo code is invalid', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 1,
        price: 100,
        category: 'Bakery',
        recipeItems: [],
      } as any);

      // Mock promo not found
      prisma.promotion.findUnique.mockResolvedValue(null);

      await expect(
        service.createOrder({ ...mockOrderData, promotionCode: 'INVALID' }),
      ).rejects.toThrow('Invalid or inactive promotion');
    });

    it('calculates discounts for points and valid percentage promo', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 1,
        price: 100,
        category: 'Bakery',
        recipeItems: [],
      } as any);

      prisma.customer.findUnique.mockResolvedValue({
        id: 1,
        phone: '1234567890',
        points: 50,
      } as any);

      prisma.promotion.findUnique.mockResolvedValue({
        id: 1,
        code: 'SALE20',
        isActive: true,
        discountType: 'PERCENTAGE',
        discountValue: 20,
      } as any);

      prisma.customer.update.mockResolvedValue({} as any);

      prisma.order.create.mockResolvedValue({ id: 1 } as any);

      await service.createOrder({
        ...mockOrderData,
        customerPhone: '1234567890',
        pointsToRedeem: 50,
        promotionCode: 'SALE20',
      });

      // Total = 2 items * 100 = 200
      // Points = 50 pts = 5 currency units (10 pts = 1 unit)
      // Promo = 20% of 200 = 40 currency units
      // Total Discount = 5 + 40 = 45
      // Net Amount = 200 - 45 = 155

      expect(prisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            discountAmount: 45,
            netAmount: 155,
            status: 'COMPLETED',
          }),
        }),
      );

      // Points deduction
      expect(prisma.customer.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { points: { decrement: 50 } },
      });
    });

    it('clamps redeemed points to what the order can absorb', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 1,
        price: 100,
        category: 'Bakery',
        recipeItems: [],
      } as any);

      prisma.customer.findUnique.mockResolvedValue({
        id: 1,
        phone: '1234567890',
        points: 5000,
      } as any);

      prisma.customer.update.mockResolvedValue({} as any);
      prisma.order.create.mockResolvedValue({ id: 1 } as any);

      await service.createOrder({
        ...mockOrderData,
        customerPhone: '1234567890',
        pointsToRedeem: 3000,
      });

      expect(prisma.customer.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { points: { decrement: 2000 } },
      });
      expect(prisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            discountAmount: 200,
            netAmount: 0,
            pointsRedeemed: 2000,
          }),
        }),
      );
    });

    it('throws when beverage product has no recipe', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 1,
        name: 'Latte',
        price: 100,
        category: 'Coffee',
        recipeItems: [],
      } as any);

      await expect(service.createOrder(mockOrderData)).rejects.toThrow(
        'Product "Latte" requires a recipe before it can be sold.',
      );
    });

    it('completes retail-only orders at checkout', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 2,
        name: 'Croissant',
        price: 80,
        category: 'Bakery',
        recipeItems: [],
      } as any);

      prisma.order.create.mockResolvedValue({
        id: 2,
        status: 'COMPLETED',
      } as any);

      await service.createOrder({
        ...mockOrderData,
        items: [{ productId: 2, quantity: 1 }],
      });

      expect(prisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'COMPLETED' }),
        }),
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('rejects terminal statuses so void/refund effects cannot be bypassed', async () => {
      await expect(service.updateOrderStatus(5, 'REFUNDED')).rejects.toThrow(
        AppException,
      );

      expect(prisma.order.findUnique).not.toHaveBeenCalled();
    });

    it('refuses to resurrect a voided/refunded order', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 5,
        branchId: TEST_BRANCH_ID,
        status: 'REFUNDED',
      } as any);

      await expect(service.updateOrderStatus(5, 'PENDING')).rejects.toThrow(
        'Voided or refunded orders cannot change status.',
      );
      expect(prisma.order.update).not.toHaveBeenCalled();
    });

    it('rejects backward transitions', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 5,
        branchId: TEST_BRANCH_ID,
        status: 'COMPLETED',
      } as any);

      await expect(service.updateOrderStatus(5, 'PREPARING')).rejects.toThrow(
        'Cannot move order from COMPLETED to PREPARING.',
      );
      expect(prisma.order.update).not.toHaveBeenCalled();
    });

    it('allows the forward KDS transition', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 5,
        branchId: TEST_BRANCH_ID,
        status: 'PENDING',
      } as any);
      prisma.order.updateMany.mockResolvedValue({ count: 1 });
      prisma.order.findUniqueOrThrow.mockResolvedValue({
        id: 5,
        status: 'PREPARING',
      } as any);

      await expect(
        service.updateOrderStatus(5, 'PREPARING'),
      ).resolves.toMatchObject({ status: 'PREPARING' });

      expect(prisma.order.updateMany).toHaveBeenCalledWith({
        where: { id: 5, status: 'PENDING' },
        data: { status: 'PREPARING' },
      });
    });

    it('rejects the transition when the order changed status concurrently', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 5,
        branchId: TEST_BRANCH_ID,
        status: 'PENDING',
      } as any);
      prisma.order.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.updateOrderStatus(5, 'PREPARING')).rejects.toThrow(
        'Order changed while updating its status. Please retry.',
      );
    });
  });

  describe('voidOrder', () => {
    const voidableOrder = {
      id: 5,
      branchId: TEST_BRANCH_ID,
      status: 'COMPLETED' as const,
      createdAt: new Date(),
      customerId: 1,
      pointsEarned: 10,
      pointsRedeemed: 5,
      netAmount: 100,
      totalCogs: 20,
      items: [
        {
          quantity: 1,
          product: {
            recipeItems: [{ ingredientId: 1, quantity: 20 }],
          },
        },
      ],
    };

    it('rejects void for already cancelled orders', async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...voidableOrder,
        status: 'CANCELLED',
      } as any);

      await expect(service.voidOrder(5)).rejects.toThrow(
        'Order is already voided or refunded.',
      );
    });

    it('rejects void for previous-day orders', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      prisma.order.findUnique.mockResolvedValue({
        ...voidableOrder,
        createdAt: yesterday,
      } as any);

      await expect(service.voidOrder(5)).rejects.toThrow(AppException);
    });

    it('voids order, restores stock, and reverses loyalty points', async () => {
      prisma.order.findUnique.mockResolvedValue(voidableOrder as any);
      prisma.branchInventory.findUnique.mockResolvedValue({
        id: 1,
        branchId: TEST_BRANCH_ID,
        ingredientId: 1,
        stock: 80,
        ingredient: { name: 'Beans' },
      } as any);
      prisma.branchInventory.update.mockResolvedValue({} as any);
      prisma.inventoryBatch.findFirst.mockResolvedValue({
        id: 2,
        quantity: 10,
        status: 'ACTIVE',
      } as any);
      prisma.inventoryBatch.update.mockResolvedValue({} as any);
      prisma.customer.updateMany.mockResolvedValue({ count: 1 });
      prisma.order.updateMany.mockResolvedValue({ count: 1 });
      prisma.order.findUniqueOrThrow.mockResolvedValue({
        ...voidableOrder,
        status: 'CANCELLED',
      } as any);

      const result = await service.voidOrder(5);

      expect(prisma.order.updateMany).toHaveBeenCalledWith({
        where: {
          id: 5,
          status: { in: ['PENDING', 'PREPARING', 'COMPLETED'] },
        },
        data: { status: 'CANCELLED' },
      });
      expect(prisma.branchInventory.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { stock: { increment: 20 } },
      });
      expect(prisma.customer.updateMany).toHaveBeenCalledWith({
        where: { id: 1, points: { gte: 5 } },
        data: { points: { decrement: 5 } },
      });
      expect(result.status).toBe('CANCELLED');
    });

    it('does not restore stock or points when a concurrent void already claimed the order', async () => {
      prisma.order.findUnique.mockResolvedValue(voidableOrder as any);
      prisma.order.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.voidOrder(5)).rejects.toThrow(
        'Order is already voided or refunded.',
      );

      expect(prisma.branchInventory.update).not.toHaveBeenCalled();
      expect(prisma.inventoryBatch.update).not.toHaveBeenCalled();
      expect(prisma.customer.updateMany).not.toHaveBeenCalled();
      expect(prisma.customer.update).not.toHaveBeenCalled();
    });

    it('floors the customer balance at zero when clawed-back points were already spent', async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...voidableOrder,
        items: [],
      } as any);
      prisma.customer.updateMany.mockResolvedValue({ count: 0 });
      prisma.customer.update.mockResolvedValue({} as any);
      prisma.order.updateMany.mockResolvedValue({ count: 1 });
      prisma.order.findUniqueOrThrow.mockResolvedValue({
        ...voidableOrder,
        status: 'CANCELLED',
      } as any);

      await service.voidOrder(5);

      expect(prisma.customer.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { points: 0 },
      });
    });
  });

  describe('refundOrder', () => {
    const refundableOrder = {
      id: 8,
      branchId: TEST_BRANCH_ID,
      status: 'COMPLETED' as const,
      createdAt: (() => {
        const d = new Date();
        d.setDate(d.getDate() - 2);
        return d;
      })(),
      customerId: 1,
      pointsEarned: 10,
      pointsRedeemed: 0,
      netAmount: 150,
      totalCogs: 25,
      items: [
        {
          quantity: 1,
          product: {
            recipeItems: [{ ingredientId: 1, quantity: 20 }],
          },
          modifiers: [],
        },
      ],
    };

    it('rejects refund for same-day orders', async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...refundableOrder,
        createdAt: new Date(),
      } as any);

      await expect(service.refundOrder(8)).rejects.toThrow(AppException);
    });

    it('refunds order, restores stock, and enqueues order.refunded', async () => {
      prisma.order.findUnique.mockResolvedValue(refundableOrder as any);
      prisma.branchInventory.findUnique.mockResolvedValue({
        id: 1,
        branchId: TEST_BRANCH_ID,
        ingredientId: 1,
        stock: 80,
        ingredient: { name: 'Beans' },
      } as any);
      prisma.branchInventory.update.mockResolvedValue({} as any);
      prisma.inventoryBatch.findFirst.mockResolvedValue({
        id: 2,
        quantity: 10,
        status: 'ACTIVE',
      } as any);
      prisma.inventoryBatch.update.mockResolvedValue({} as any);
      prisma.customer.updateMany.mockResolvedValue({ count: 1 });
      prisma.order.updateMany.mockResolvedValue({ count: 1 });
      prisma.order.findUniqueOrThrow.mockResolvedValue({
        ...refundableOrder,
        status: 'REFUNDED',
        refundReason: 'Wrong drink',
      } as any);

      const result = await service.refundOrder(8, 'Wrong drink');

      expect(result.status).toBe('REFUNDED');
      expect(prisma.order.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 8, status: 'COMPLETED' },
          data: expect.objectContaining({
            status: 'REFUNDED',
            refundReason: 'Wrong drink',
          }),
        }),
      );
    });

    it('does not restore stock or points when a concurrent refund already claimed the order', async () => {
      prisma.order.findUnique.mockResolvedValue(refundableOrder as any);
      prisma.order.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.refundOrder(8, 'Wrong drink')).rejects.toThrow(
        'Order is already voided or refunded.',
      );

      expect(prisma.branchInventory.update).not.toHaveBeenCalled();
      expect(prisma.inventoryBatch.update).not.toHaveBeenCalled();
      expect(prisma.customer.updateMany).not.toHaveBeenCalled();
    });
  });
});
