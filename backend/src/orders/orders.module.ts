import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderCreationService } from './order-creation.service';
import { OrderLifecycleService } from './order-lifecycle.service';
import { ProcurementModule } from '../procurement/procurement.module';
import { CustomersModule } from '../customers/customers.module';
import { AccountingModule } from '../accounting/accounting.module';
import { OutboxModule } from '../outbox/outbox.module';
import { SettingsModule } from '../settings/settings.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    ProcurementModule,
    CustomersModule,
    AccountingModule,
    OutboxModule,
    SettingsModule,
    AuditModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrderCreationService, OrderLifecycleService],
})
export class OrdersModule {}
