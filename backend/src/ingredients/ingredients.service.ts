import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IngredientsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; unit: string; stock?: number; minStock?: number }) {
    return this.prisma.ingredient.create({ data });
  }

  async findAll() {
    return this.prisma.ingredient.findMany();
  }

  async findOne(id: number) {
    return this.prisma.ingredient.findUnique({ where: { id } });
  }

  async update(id: number, data: { name?: string; unit?: string; stock?: number; minStock?: number }) {
    return this.prisma.ingredient.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.ingredient.delete({ where: { id } });
  }

  async getBranchInventory(branchId: number) {
    return this.prisma.branchInventory.findMany({
      where: { branchId },
      include: { ingredient: true }
    });
  }

  async recordWaste(data: { branchId: number; ingredientId: number; quantity: number; reason: string; recordedById: number }) {
    return this.prisma.$transaction(async (tx) => {
      const log = await tx.wasteLog.create({
        data: {
          branchId: data.branchId,
          ingredientId: data.ingredientId,
          quantity: data.quantity,
          reason: data.reason,
          recordedById: data.recordedById,
        }
      });

      const inventory = await tx.branchInventory.findUnique({
        where: { branchId_ingredientId: { branchId: data.branchId, ingredientId: data.ingredientId } }
      });

      if (inventory) {
        await tx.branchInventory.update({
          where: { id: inventory.id },
          data: { stock: { decrement: data.quantity } }
        });
      }

      return log;
    });
  }

  async getWasteLogs(branchId: number) {
    return this.prisma.wasteLog.findMany({
      where: { branchId },
      include: { ingredient: true, recordedBy: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }
}
