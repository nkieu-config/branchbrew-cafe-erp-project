import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { dec, roundMoney } from '../common/decimal.util';
import {
  assertBranchAccess,
  BranchScopedUser,
} from '../auth/branch-scope.util';
import { ProductionOrder, ProductionStatus } from '@prisma/client';
import { OutboxService } from '../outbox/outbox.service';
import { OUTBOX_EVENT_TYPES } from '../outbox/outbox-event.types';
import { InventoryHelper } from '../common/helpers/inventory.helper';
import { toProductionCompletedSnapshot } from './domain/production-completed.snapshot';
import {
  allocateProductionOrderNumber,
  isProductionOrderNumberConflict,
  MAX_PRODUCTION_ORDER_NUMBER_RETRIES,
} from './helpers/production-order-number.helper';

const TERMINAL_PRODUCTION_STATUSES: ProductionStatus[] = [
  'COMPLETED',
  'CANCELLED',
];

@Injectable()
export class ProductionService {
  constructor(
    private prisma: PrismaService,
    private outboxService: OutboxService,
  ) {}

  // 1. Get all Production Orders
  async getProductionOrders(branchId?: number) {
    return this.prisma.productionOrder.findMany({
      where: branchId ? { branchId } : undefined,
      include: {
        branch: true,
        targetIngredient: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 2. Get BOMs
  async getBOMs() {
    return this.prisma.productionBOM.findMany({
      include: {
        targetIngredient: true,
        rawIngredient: true,
      },
    });
  }

  // 3. Create a Production Order
  async createProductionOrder(
    data: {
      branchId: number;
      targetIngredientId: number;
      quantityToProduce: number;
      plannedStartDate?: Date;
    },
    attempt = 1,
  ): Promise<ProductionOrder> {
    // Ensure the branch is a central kitchen
    const branch = await this.prisma.branch.findUnique({
      where: { id: data.branchId },
    });
    if (!branch || !branch.isCentralKitchen) {
      throw new BadRequestException('Branch is not a central kitchen');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const orderNumber = await allocateProductionOrderNumber(tx);
        return tx.productionOrder.create({
          data: {
            orderNumber,
            branchId: data.branchId,
            targetIngredientId: data.targetIngredientId,
            quantityToProduce: data.quantityToProduce,
            plannedStartDate: data.plannedStartDate,
            status: 'PLANNED',
          },
        });
      });
    } catch (err) {
      if (
        isProductionOrderNumberConflict(err) &&
        attempt < MAX_PRODUCTION_ORDER_NUMBER_RETRIES
      ) {
        return this.createProductionOrder(data, attempt + 1);
      }
      throw err;
    }
  }

  // Update Order Status (for Kanban dragging)
  async updateOrderStatus(
    orderId: number,
    status: ProductionStatus,
    user: BranchScopedUser,
  ) {
    if (status === 'COMPLETED') {
      throw new BadRequestException(
        'Use the complete endpoint to finish production orders.',
      );
    }

    const order = await this.prisma.productionOrder.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new BadRequestException('Order not found');
    assertBranchAccess(user, order.branchId);

    if (TERMINAL_PRODUCTION_STATUSES.includes(order.status)) {
      throw new BadRequestException(
        `Cannot change status of a ${order.status.toLowerCase()} production order.`,
      );
    }

    return this.prisma.productionOrder.update({
      where: { id: orderId },
      data: { status },
    });
  }

  // 4. Complete a Production Order (Deduct raw materials, add finished good)
  async completeProductionOrder(
    orderId: number,
    userId?: number,
    user?: BranchScopedUser,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.productionOrder.findUnique({
        where: { id: orderId },
        include: { targetIngredient: true },
      });

      if (!order) throw new BadRequestException('Order not found');
      if (user) assertBranchAccess(user, order.branchId);
      if (order.status === 'COMPLETED')
        throw new BadRequestException('Order already completed');
      if (order.status === 'CANCELLED')
        throw new BadRequestException(
          'Cancelled production orders cannot be completed.',
        );

      // Find BOM for the target ingredient
      const boms = await tx.productionBOM.findMany({
        where: { targetIngredientId: order.targetIngredientId },
        include: { rawIngredient: true },
      });

      if (boms.length === 0) {
        throw new BadRequestException('No BOM found for this ingredient');
      }

      let rawCost = dec(0);
      const rawRequirements = new Map<number, number>();

      for (const bom of boms) {
        const requiredQuantity = bom.quantityNeeded * order.quantityToProduce;
        rawRequirements.set(
          bom.rawIngredientId,
          (rawRequirements.get(bom.rawIngredientId) ?? 0) + requiredQuantity,
        );
        rawCost = rawCost.plus(
          dec(bom.rawIngredient.costPerUnit).times(requiredQuantity),
        );
      }

      await InventoryHelper.deductInventoryFIFO(
        tx,
        order.branchId,
        rawRequirements,
      );

      const totalRawCost = roundMoney(rawCost);
      const finishedGoodsValue = roundMoney(
        dec(order.targetIngredient.costPerUnit).times(order.quantityToProduce),
      );

      // Add Finished Good to Inventory
      const targetInventory = await tx.branchInventory.findUnique({
        where: {
          branchId_ingredientId: {
            branchId: order.branchId,
            ingredientId: order.targetIngredientId,
          },
        },
      });

      if (targetInventory) {
        await tx.branchInventory.update({
          where: { id: targetInventory.id },
          data: { stock: { increment: order.quantityToProduce } },
        });
      } else {
        await tx.branchInventory.create({
          data: {
            branchId: order.branchId,
            ingredientId: order.targetIngredientId,
            stock: order.quantityToProduce,
            minStock: 0,
          },
        });
      }

      await tx.inventoryBatch.create({
        data: {
          branchId: order.branchId,
          ingredientId: order.targetIngredientId,
          quantity: order.quantityToProduce,
          status: 'ACTIVE',
        },
      });

      // Mark Order as COMPLETED
      const updatedOrder = await tx.productionOrder.update({
        where: { id: orderId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          actualCost: totalRawCost,
          createdByUserId: userId,
        },
      });

      if (totalRawCost > 0) {
        await this.outboxService.enqueue(
          tx,
          OUTBOX_EVENT_TYPES.PRODUCTION_COMPLETED,
          {
            production: toProductionCompletedSnapshot({
              orderNumber: updatedOrder.orderNumber,
              targetIngredientName: order.targetIngredient.name,
              branchId: order.branchId,
              totalRawCost,
              finishedGoodsValue,
            }),
          },
        );
      }

      return updatedOrder;
    });
  }

  // Helper to create BOM
  async createBOM(data: {
    targetIngredientId: number;
    rawIngredientId: number;
    quantityNeeded: number;
  }) {
    return this.prisma.productionBOM.upsert({
      where: {
        targetIngredientId_rawIngredientId: {
          targetIngredientId: data.targetIngredientId,
          rawIngredientId: data.rawIngredientId,
        },
      },
      update: { quantityNeeded: data.quantityNeeded },
      create: {
        targetIngredientId: data.targetIngredientId,
        rawIngredientId: data.rawIngredientId,
        quantityNeeded: data.quantityNeeded,
      },
    });
  }
}
