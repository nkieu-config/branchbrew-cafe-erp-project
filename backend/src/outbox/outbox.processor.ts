import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  MAX_OUTBOX_ATTEMPTS,
  OUTBOX_BATCH_SIZE,
  STALE_PROCESSING_MS,
} from './outbox.constants';
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
    const staleBefore = new Date(Date.now() - STALE_PROCESSING_MS);

    const events = await this.prisma.outboxEvent.findMany({
      where: {
        OR: [
          { status: 'PENDING' },
          {
            status: 'FAILED',
            attempts: { lt: MAX_OUTBOX_ATTEMPTS },
          },
          {
            status: 'PROCESSING',
            claimedAt: { lt: staleBefore },
          },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: OUTBOX_BATCH_SIZE,
    });

    for (const event of events) {
      const isStaleClaim = event.status === 'PROCESSING';

      if (isStaleClaim && event.attempts >= MAX_OUTBOX_ATTEMPTS) {
        await this.abandonStaleClaim(event.id, event.attempts, staleBefore);
        continue;
      }

      const claimWhere: Prisma.OutboxEventWhereInput = {
        id: event.id,
        status: event.status,
        attempts: event.attempts,
        ...(isStaleClaim ? { claimedAt: { lt: staleBefore } } : {}),
      };

      const claimed = await this.prisma.outboxEvent.updateMany({
        where: claimWhere,
        data: {
          status: 'PROCESSING',
          attempts: { increment: 1 },
          claimedAt: new Date(),
        },
      });

      if (claimed.count === 0) continue;

      if (isStaleClaim) {
        this.logger.warn(
          `Outbox event ${event.id} (${event.eventType}) was reclaimed after a stale PROCESSING claim`,
        );
      }

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

  private async abandonStaleClaim(
    id: number,
    attempts: number,
    staleBefore: Date,
  ) {
    const abandoned = await this.prisma.outboxEvent.updateMany({
      where: {
        id,
        status: 'PROCESSING',
        attempts,
        claimedAt: { lt: staleBefore },
      },
      data: {
        status: 'FAILED',
        lastError: `Abandoned after a stale PROCESSING claim at attempt ${attempts}/${MAX_OUTBOX_ATTEMPTS}`,
      },
    });

    if (abandoned.count > 0) {
      this.logger.error(
        `Outbox event ${id} abandoned: stale PROCESSING claim exhausted its ${MAX_OUTBOX_ATTEMPTS} attempts`,
      );
    }
  }
}
