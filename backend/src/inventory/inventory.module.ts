import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { StockCountService } from './stock-count.service';
import { InventoryController } from './inventory.controller';
import { InventoryBatchExpiryProcessor } from './inventory-batch-expiry.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { OutboxModule } from '../outbox/outbox.module';

@Module({
  imports: [PrismaModule, OutboxModule],
  controllers: [InventoryController],
  providers: [
    InventoryService,
    StockCountService,
    InventoryBatchExpiryProcessor,
  ],
  exports: [InventoryService],
})
export class InventoryModule {}
