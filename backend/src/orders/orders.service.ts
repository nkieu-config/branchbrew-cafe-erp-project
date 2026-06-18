import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(data: { userId: number; branchId: number; items: { productId: number; quantity: number }[] }) {
    // We must do this in a transaction to ensure data integrity
    return this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;

      // 1. Calculate required ingredients and total amount
      const ingredientRequirements = new Map<number, number>();

      for (const item of data.items) {
        // Fetch product with its recipe
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { recipeItems: true },
        });

        if (!product) {
          throw new BadRequestException(`Product with ID ${item.productId} not found`);
        }

        totalAmount += product.price * item.quantity;

        // Calculate ingredients needed
        for (const recipe of product.recipeItems) {
          const totalNeeded = recipe.quantity * item.quantity;
          const currentNeeded = ingredientRequirements.get(recipe.ingredientId) || 0;
          ingredientRequirements.set(recipe.ingredientId, currentNeeded + totalNeeded);
        }
      }

      // 2. Verify stock in BranchInventory and deduct
      for (const [ingredientId, neededQty] of ingredientRequirements.entries()) {
        const branchInventory = await tx.branchInventory.findUnique({
          where: { branchId_ingredientId: { branchId: data.branchId, ingredientId } },
          include: { ingredient: true }
        });

        if (!branchInventory) {
          throw new BadRequestException(`Ingredient ID ${ingredientId} not found in this branch`);
        }

        if (branchInventory.stock < neededQty) {
          throw new BadRequestException(
            `Not enough stock for ${branchInventory.ingredient.name} at this branch. Needed: ${neededQty}, Available: ${branchInventory.stock}`
          );
        }

        // Deduct stock
        await tx.branchInventory.update({
          where: { id: branchInventory.id },
          data: { stock: branchInventory.stock - neededQty },
        });
      }

      // 3. Create the Order
      const order = await tx.order.create({
        data: {
          userId: data.userId, // Normally comes from JWT token
          branchId: data.branchId, // Normally comes from JWT token
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
