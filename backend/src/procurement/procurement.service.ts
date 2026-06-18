import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProcurementService {
  constructor(private prisma: PrismaService) {}

  // Suppliers
  findAllSuppliers() {
    return this.prisma.supplier.findMany();
  }

  // Purchase Orders
  findAllPOs() {
    return this.prisma.purchaseOrder.findMany({
      include: { supplier: true, branch: true, items: { include: { ingredient: true } } }
    });
  }

  async createPO(data: { branchId: number, supplierId: number, items: { ingredientId: number, quantity: number, price: number }[] }) {
    return this.prisma.purchaseOrder.create({
      data: {
        poNumber: `PO-${Date.now()}`,
        branchId: data.branchId,
        supplierId: data.supplierId,
        status: 'PENDING',
        items: {
          create: data.items.map(item => ({
            ingredientId: item.ingredientId,
            quantityRequested: item.quantity,
            unitPrice: item.price
          }))
        }
      },
      include: { items: true }
    });
  }

  async receivePO(poId: number) {
    return this.prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findUnique({
        where: { id: poId },
        include: { items: true }
      });

      if (!po) throw new BadRequestException('PO not found');
      if (po.status === 'RECEIVED') throw new BadRequestException('PO already received');

      // Update BranchInventory
      for (const item of po.items) {
        const inventory = await tx.branchInventory.findUnique({
          where: { branchId_ingredientId: { branchId: po.branchId, ingredientId: item.ingredientId } }
        });

        if (inventory) {
          await tx.branchInventory.update({
            where: { id: inventory.id },
            data: { stock: inventory.stock + item.quantityRequested }
          });
        } else {
          await tx.branchInventory.create({
            data: {
              branchId: po.branchId,
              ingredientId: item.ingredientId,
              stock: item.quantityRequested,
              minStock: 0 // Default
            }
          });
        }
      }

      // Mark PO as RECEIVED
      return tx.purchaseOrder.update({
        where: { id: poId },
        data: { status: 'RECEIVED' }
      });
    });
  }
}
