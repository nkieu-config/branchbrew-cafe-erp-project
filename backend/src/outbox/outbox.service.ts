import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  OutboxEventPayload,
  OutboxEventType,
  toOutboxJsonValue,
} from './outbox-event.types';

@Injectable()
export class OutboxService {
  enqueue<T extends OutboxEventType>(
    tx: Prisma.TransactionClient,
    eventType: T,
    payload: OutboxEventPayload<T>,
  ) {
    return tx.outboxEvent.create({
      data: {
        eventType,
        payload: toOutboxJsonValue(payload),
      },
    });
  }
}
