import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(data: { userId: number; branchId: number; items: { productId: number; quantity: number }[] }) {
    return this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;

      const ingredientRequirements = new Map<number, number>();

      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { recipeItems: true },
        });

        if (!product) throw new BadRequestException(`Product with ID ${item.productId} not found`);

        totalAmount += product.price * item.quantity;

        for (const recipe of product.recipeItems) {
          const totalNeeded = recipe.quantity * item.quantity;
          const currentNeeded = ingredientRequirements.get(recipe.ingredientId) || 0;
          ingredientRequirements.set(recipe.ingredientId, currentNeeded + totalNeeded);
        }
      }

      for (const [ingredientId, neededQty] of ingredientRequirements.entries()) {
        const branchInventory = await tx.branchInventory.findUnique({
          where: { branchId_ingredientId: { branchId: data.branchId, ingredientId } },
          include: { ingredient: true }
        });

        if (!branchInventory || branchInventory.stock < neededQty) {
          const name = branchInventory?.ingredient?.name || `ID ${ingredientId}`;
          throw new BadRequestException(`Not enough stock for ${name} at this branch.`);
        }

        // Deduct from BranchInventory (Cache)
        await tx.branchInventory.update({
          where: { id: branchInventory.id },
          data: { stock: branchInventory.stock - neededQty },
        });

        // FIFO Deduction from InventoryBatch
        let remainingToDeduct = neededQty;
        const activeBatches = await tx.inventoryBatch.findMany({
          where: { 
            branchId: data.branchId, 
            ingredientId, 
            status: 'ACTIVE' 
          },
          orderBy: [
            { expiryDate: 'asc' }, // Expiring soonest first
            { createdAt: 'asc' }   // Oldest first if no expiry
          ]
        });

        for (const batch of activeBatches) {
          if (remainingToDeduct <= 0) break;

          if (batch.quantity <= remainingToDeduct) {
            // Deduct whole batch and mark depleted
            remainingToDeduct -= batch.quantity;
            await tx.inventoryBatch.update({
              where: { id: batch.id },
              data: { quantity: 0, status: 'DEPLETED' }
            });
          } else {
            // Deduct partial batch
            await tx.inventoryBatch.update({
              where: { id: batch.id },
              data: { quantity: batch.quantity - remainingToDeduct }
            });
            remainingToDeduct = 0;
          }
        }

        if (remainingToDeduct > 0) {
          // This shouldn't happen if BranchInventory is in sync, but just in case
          throw new BadRequestException(`Inventory batches out of sync for ingredient ID ${ingredientId}`);
        }
      }

      const order = await tx.order.create({
        data: {
          userId: data.userId,
          branchId: data.branchId,
          totalAmount,
          items: {
            create: await Promise.all(data.items.map(async (item) => {
              const product = await tx.product.findUnique({ where: { id: item.productId } });
              return {
                productId: item.productId,
                quantity: item.quantity,
                price: product!.price,
              };
            }))
          }
        },
        include: { items: true },
      });

      return order;
    });
  }

  async findAll() {
    return this.prisma.order.findMany({ include: { items: true, branch: true } });
  }

  async findOne(id: number) {
    return this.prisma.order.findUnique({ where: { id }, include: { items: true, branch: true } });
  }
}
