import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { MAX_OUTBOX_ATTEMPTS, OUTBOX_BATCH_SIZE } from './outbox.constants';
import { dispatchOutboxEvent } from './outbox-event.registry';

@Injectable()
export class OutboxProcessor {
  private readonly logger = new Logger(OutboxProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Cron('*/10 * * * * *')
  async handleCron() {
    const events = await this.prisma.outboxEvent.findMany({
      where: {
        OR: [
          { status: 'PENDING' },
          {
            status: 'FAILED',
            attempts: { lt: MAX_OUTBOX_ATTEMPTS },
          },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: OUTBOX_BATCH_SIZE,
    });

    for (const event of events) {
      const claimed = await this.prisma.outboxEvent.updateMany({
        where: {
          id: event.id,
          status: event.status,
          attempts: event.attempts,
        },
        data: {
          status: 'PROCESSING',
          attempts: { increment: 1 },
        },
      });

      if (claimed.count === 0) continue;

      try {
        await dispatchOutboxEvent(
          event.eventType,
          event.payload,
          this.eventEmitter,
        );
        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            status: 'COMPLETED',
            processedAt: new Date(),
            lastError: null,
          },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const updated = await this.prisma.outboxEvent.findUnique({
          where: { id: event.id },
        });
        const attempts = updated?.attempts ?? MAX_OUTBOX_ATTEMPTS;
        const willRetry = attempts < MAX_OUTBOX_ATTEMPTS;

        this.logger.error(
          `Outbox event ${event.id} (${event.eventType}) failed (attempt ${attempts}/${MAX_OUTBOX_ATTEMPTS}): ${message}`,
        );

        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            status: willRetry ? 'PENDING' : 'FAILED',
            lastError: message,
          },
        });
      }
    }
  }
}
