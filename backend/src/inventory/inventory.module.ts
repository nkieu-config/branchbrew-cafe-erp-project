import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryBatchExpiryProcessor } from './inventory-batch-expiry.processor';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryBatchExpiryProcessor],
  exports: [InventoryService],
})
export class InventoryModule {}
