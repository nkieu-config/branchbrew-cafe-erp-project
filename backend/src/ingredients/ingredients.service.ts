import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { provisionBranchInventoryForIngredient } from '../inventory/branch-inventory-provision.helper';

@Injectable()
export class IngredientsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    unit: string;
    costPerUnit?: number;
    primarySupplierId?: number;
    isActive?: boolean;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const ingredient = await tx.ingredient.create({ data });
      await provisionBranchInventoryForIngredient(tx, ingredient.id);
      return ingredient;
    });
  }

  /** Backfill BranchInventory rows for an existing ingredient (idempotent). */
  async syncBranchInventory(ingredientId: number) {
    const rowsCreated = await provisionBranchInventoryForIngredient(
      this.prisma,
      ingredientId,
    );
    return { ingredientId, rowsCreated };
  }

  async findAll() {
    return this.prisma.ingredient.findMany({
      include: { primarySupplier: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.ingredient.findUnique({
      where: { id },
      include: { primarySupplier: true },
    });
  }

  async update(
    id: number,
    data: {
      name?: string;
      unit?: string;
      costPerUnit?: number;
      primarySupplierId?: number;
      isActive?: boolean;
    },
  ) {
    return this.prisma.ingredient.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.ingredient.delete({ where: { id } });
  }

  async getBranchInventory(branchId: number) {
    return this.prisma.branchInventory.findMany({
      where: { branchId },
      include: { ingredient: true },
    });
  }

  async getWasteLogs(branchId: number) {
    return this.prisma.wasteLog.findMany({
      where: { branchId },
      include: { ingredient: true, recordedBy: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
