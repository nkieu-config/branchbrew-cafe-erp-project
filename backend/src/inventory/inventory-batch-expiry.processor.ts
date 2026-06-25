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

    const result = await this.prisma.inventoryBatch.updateMany({
      where: {
        status: 'ACTIVE',
        expiryDate: { not: null, lt: now },
        quantity: { gt: 0 },
      },
      data: { status: 'EXPIRED' },
    });

    if (result.count > 0) {
      this.logger.log(`Marked ${result.count} inventory batch(es) as EXPIRED`);
    }
  }
}
