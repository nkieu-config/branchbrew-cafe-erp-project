import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { WasteDisposalHelper } from './helpers/waste-disposal.helper';

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
        const log = await WasteDisposalHelper.disposeBatchAsWaste(tx, {
          batchId: batch.id,
          userId: systemUser.id,
          reason: 'Auto-disposed: batch expired',
          batchStatus: 'EXPIRED',
          audit: {
            action: 'AUTO_WASTE',
            details: `Auto-disposed expired batch #${batch.id}`,
          },
        });
        return log !== null;
      });

      if (didDispose) disposed++;
    }

    if (disposed > 0) {
      this.logger.log(`Auto-disposed ${disposed} expired batch(es)`);
    }
  }
}
