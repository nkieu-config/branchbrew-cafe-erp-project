import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';
import { OrderCreatedEvent } from '../orders/events/order-created.event';

@Injectable()
export class NotificationsProducer {
  private readonly logger = new Logger(NotificationsProducer.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  @OnEvent('order.created', { async: true })
  async handleOrderCreated(event: OrderCreatedEvent) {
    for (const ingredientId of event.ingredientRequirements.keys()) {
      const inventory = await this.prisma.branchInventory.findUnique({
        where: {
          branchId_ingredientId: { branchId: event.branchId, ingredientId },
        },
        include: { ingredient: { select: { name: true, unit: true } } },
      });
      if (!inventory || inventory.stock > inventory.minStock) continue;

      await this.notifications.notifyBranch({
        branchId: event.branchId,
        type: 'LOW_STOCK',
        title: `${inventory.ingredient.name} is running low`,
        body: `${inventory.stock} ${inventory.ingredient.unit} left (min ${inventory.minStock})`,
        link: '/inventory',
        dedupeKey: `low-stock-${ingredientId}`,
      });
    }
  }

  @Cron('0 0 8 * * *')
  async notifyExpiringBatches() {
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + 7);
    warningDate.setHours(23, 59, 59, 999);

    const grouped = await this.prisma.inventoryBatch.groupBy({
      by: ['branchId'],
      where: {
        quantity: { gt: 0 },
        status: { in: ['ACTIVE', 'EXPIRED'] },
        expiryDate: { not: null, lte: warningDate },
      },
      _count: { _all: true },
    });

    for (const group of grouped) {
      await this.notifications.notifyBranch({
        branchId: group.branchId,
        type: 'BATCH_EXPIRING',
        title: `${group._count._all} batch${group._count._all === 1 ? '' : 'es'} expiring within 7 days`,
        link: '/inventory/batches',
        dedupeKey: 'expiring-batches',
      });
    }

    this.logger.log(
      `Expiry notifications checked for ${grouped.length} branch(es).`,
    );
  }
}
