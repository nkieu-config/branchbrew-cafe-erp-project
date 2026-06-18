import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.branch.findMany({
      include: {
        inventories: {
          include: { ingredient: true }
        }
      }
    });
  }

  async findOne(id: number) {
    return this.prisma.branch.findUnique({
      where: { id },
      include: {
        inventories: {
          include: { ingredient: true }
        },
        inventoryBatches: {
          where: { status: 'ACTIVE' },
          include: { ingredient: true },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  }

  async createTransfer(data: { fromBranchId: number, toBranchId: number, ingredientId: number, quantity: number, requestedById: number }) {
    // Basic validation
    const fromInv = await this.prisma.branchInventory.findUnique({
      where: { branchId_ingredientId: { branchId: data.fromBranchId, ingredientId: data.ingredientId } }
    });

    if (!fromInv || fromInv.stock < data.quantity) {
      throw new BadRequestException('Not enough stock in the source branch.');
    }

    return this.prisma.stockTransfer.create({
      data: {
        fromBranchId: data.fromBranchId,
        toBranchId: data.toBranchId,
        ingredientId: data.ingredientId,
        quantity: data.quantity,
        requestedById: data.requestedById,
        status: 'PENDING'
      }
    });
  }

  async getTransfers(branchId: number) {
    return this.prisma.stockTransfer.findMany({
      where: {
        OR: [
          { fromBranchId: branchId },
          { toBranchId: branchId }
        ]
      },
      include: {
        fromBranch: true,
        toBranch: true,
        ingredient: true,
        requestedBy: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async acceptTransfer(transferId: number, approvedById: number) {
    return this.prisma.$transaction(async (tx) => {
      const transfer = await tx.stockTransfer.findUnique({ where: { id: transferId } });
      if (!transfer) throw new BadRequestException('Transfer not found');
      if (transfer.status !== 'PENDING') throw new BadRequestException('Transfer already processed');

      // Deduct from Source InventoryBatch
      let remainingToDeduct = transfer.quantity;
      const activeBatches = await tx.inventoryBatch.findMany({
        where: { branchId: transfer.fromBranchId, ingredientId: transfer.ingredientId, status: 'ACTIVE' },
        orderBy: [{ expiryDate: 'asc' }, { createdAt: 'asc' }]
      });

      for (const batch of activeBatches) {
        if (remainingToDeduct <= 0) break;
        if (batch.quantity <= remainingToDeduct) {
          remainingToDeduct -= batch.quantity;
          await tx.inventoryBatch.update({ where: { id: batch.id }, data: { quantity: 0, status: 'DEPLETED' } });
        } else {
          await tx.inventoryBatch.update({ where: { id: batch.id }, data: { quantity: batch.quantity - remainingToDeduct } });
          remainingToDeduct = 0;
        }
      }
      
      if (remainingToDeduct > 0) {
        throw new BadRequestException('Source branch does not have enough batches to transfer');
      }

      // Deduct from Source BranchInventory
      await tx.branchInventory.update({
        where: { branchId_ingredientId: { branchId: transfer.fromBranchId, ingredientId: transfer.ingredientId } },
        data: { stock: { decrement: transfer.quantity } }
      });

      // Add to Target InventoryBatch
      await tx.inventoryBatch.create({
        data: {
          branchId: transfer.toBranchId,
          ingredientId: transfer.ingredientId,
          quantity: transfer.quantity,
          status: 'ACTIVE'
        }
      });

      // Add to Target BranchInventory
      const targetInv = await tx.branchInventory.findUnique({
        where: { branchId_ingredientId: { branchId: transfer.toBranchId, ingredientId: transfer.ingredientId } }
      });

      if (targetInv) {
        await tx.branchInventory.update({
          where: { id: targetInv.id },
          data: { stock: { increment: transfer.quantity } }
        });
      } else {
        await tx.branchInventory.create({
          data: {
            branchId: transfer.toBranchId,
            ingredientId: transfer.ingredientId,
            stock: transfer.quantity,
            minStock: 0
          }
        });
      }

      // Record AuditLog
      await tx.auditLog.create({
        data: {
          userId: approvedById,
          action: 'ACCEPT_TRANSFER',
          targetType: 'StockTransfer',
          targetId: transferId,
          details: `Transferred ${transfer.quantity} of Ingredient ${transfer.ingredientId} from Branch ${transfer.fromBranchId} to ${transfer.toBranchId}`
        }
      });

      return tx.stockTransfer.update({
        where: { id: transferId },
        data: { status: 'COMPLETED', approvedById }
      });
    });
  }
}
