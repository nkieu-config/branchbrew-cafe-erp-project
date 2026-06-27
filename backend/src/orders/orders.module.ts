import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ProcurementModule } from '../procurement/procurement.module';
import { CustomersModule } from '../customers/customers.module';
import { AccountingModule } from '../accounting/accounting.module';
import { OutboxModule } from '../outbox/outbox.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    ProcurementModule,
    CustomersModule,
    AccountingModule,
    OutboxModule,
    SettingsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
