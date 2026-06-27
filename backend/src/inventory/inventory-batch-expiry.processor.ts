import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryBatchExpiryProcessor {
  private readonly logger = new Logger(InventoryBatchExpiryProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 * * * *')
  async markExpiredBatches() {
    const now = new Date();

    const batches = await this.prisma.inventoryBatch.findMany({
      where: {
        status: 'ACTIVE',
        expiryDate: { not: null, lt: now },
        quantity: { gt: 0 },
      },
    });

    if (batches.length === 0) return;

    const systemUser = await this.prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
      orderBy: { id: 'asc' },
    });

    if (!systemUser) {
      this.logger.warn(
        'No SUPER_ADMIN user found; skipping auto-waste for expired batches',
      );
      return;
    }

    let disposed = 0;

    for (const batch of batches) {
      const didDispose = await this.prisma.$transaction(async (tx) => {
        const current = await tx.inventoryBatch.findUnique({
          where: { id: batch.id },
        });
        if (
          !current ||
          current.status !== 'ACTIVE' ||
          current.quantity <= 0
        ) {
          return false;
        }

        const qty = current.quantity;

        await tx.wasteLog.create({
          data: {
            branchId: current.branchId,
            ingredientId: current.ingredientId,
            quantity: qty,
            reason: 'Auto-disposed: batch expired',
            recordedById: systemUser.id,
          },
        });

        const inventory = await tx.branchInventory.findUnique({
          where: {
            branchId_ingredientId: {
              branchId: current.branchId,
              ingredientId: current.ingredientId,
            },
          },
        });

        if (inventory) {
          await tx.branchInventory.update({
            where: { id: inventory.id },
            data: { stock: Math.max(0, inventory.stock - qty) },
          });
        }

        await tx.inventoryBatch.update({
          where: { id: current.id },
          data: { status: 'EXPIRED', quantity: 0 },
        });

        return true;
      });

      if (didDispose) disposed++;
    }

    if (disposed > 0) {
      this.logger.log(`Auto-disposed ${disposed} expired batch(es)`);
    }
  }
}
