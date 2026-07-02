import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderCreatedEvent } from '../orders/events/order-created.event';
import { OrderVoidedEvent } from '../orders/events/order-voided.event';
import { OrderRefundedEvent } from '../orders/events/order-refunded.event';
import { OrderStatusUpdatedEvent } from '../orders/events/order-status-updated.event';
import { PurchaseOrderReceivedEvent } from '../procurement/events/purchase-order-received.event';
import { ProductionCompletedEvent } from '../production/events/production-completed.event';
import {
  assertOutboxPayload,
  isOutboxEventType,
  OUTBOX_EVENT_TYPES,
  OutboxEventType,
} from './outbox-event.types';

type OutboxDispatchHandler = (
  payload: unknown,
  eventEmitter: EventEmitter2,
) => Promise<void>;

const outboxEventRegistry: Record<OutboxEventType, OutboxDispatchHandler> = {
  [OUTBOX_EVENT_TYPES.ORDER_CREATED]: async (payload, eventEmitter) => {
    const data = assertOutboxPayload(
      OUTBOX_EVENT_TYPES.ORDER_CREATED,
      payload,
    );
    const map = new Map<number, number>(data.ingredientRequirements);
    await eventEmitter.emitAsync(
      OUTBOX_EVENT_TYPES.ORDER_CREATED,
      new OrderCreatedEvent(
        data.order,
        map,
        data.branchId,
        data.customerId,
      ),
    );
  },
  [OUTBOX_EVENT_TYPES.ORDER_STATUS_UPDATED]: async (payload, eventEmitter) => {
    const data = assertOutboxPayload(
      OUTBOX_EVENT_TYPES.ORDER_STATUS_UPDATED,
      payload,
    );
    await eventEmitter.emitAsync(
      OUTBOX_EVENT_TYPES.ORDER_STATUS_UPDATED,
      new OrderStatusUpdatedEvent(data.orderId, data.status, data.branchId),
    );
  },
  [OUTBOX_EVENT_TYPES.ORDER_VOIDED]: async (payload, eventEmitter) => {
    const data = assertOutboxPayload(OUTBOX_EVENT_TYPES.ORDER_VOIDED, payload);
    await eventEmitter.emitAsync(
      OUTBOX_EVENT_TYPES.ORDER_VOIDED,
      new OrderVoidedEvent(data.order),
    );
  },
  [OUTBOX_EVENT_TYPES.ORDER_REFUNDED]: async (payload, eventEmitter) => {
    const data = assertOutboxPayload(
      OUTBOX_EVENT_TYPES.ORDER_REFUNDED,
      payload,
    );
    await eventEmitter.emitAsync(
      OUTBOX_EVENT_TYPES.ORDER_REFUNDED,
      new OrderRefundedEvent(data.order, data.reason),
    );
  },
  [OUTBOX_EVENT_TYPES.PURCHASE_ORDER_RECEIVED]: async (
    payload,
    eventEmitter,
  ) => {
    const data = assertOutboxPayload(
      OUTBOX_EVENT_TYPES.PURCHASE_ORDER_RECEIVED,
      payload,
    );
    await eventEmitter.emitAsync(
      OUTBOX_EVENT_TYPES.PURCHASE_ORDER_RECEIVED,
      new PurchaseOrderReceivedEvent(data.purchaseOrder),
    );
  },
  [OUTBOX_EVENT_TYPES.PRODUCTION_COMPLETED]: async (payload, eventEmitter) => {
    const data = assertOutboxPayload(
      OUTBOX_EVENT_TYPES.PRODUCTION_COMPLETED,
      payload,
    );
    await eventEmitter.emitAsync(
      OUTBOX_EVENT_TYPES.PRODUCTION_COMPLETED,
      new ProductionCompletedEvent(data.production),
    );
  },
};

export async function dispatchOutboxEvent(
  eventType: string,
  payload: unknown,
  eventEmitter: EventEmitter2,
): Promise<void> {
  if (!isOutboxEventType(eventType)) {
    throw new Error(`Unhandled outbox event type: ${eventType}`);
  }

  await outboxEventRegistry[eventType](payload, eventEmitter);
}

export function listRegisteredOutboxEventTypes(): OutboxEventType[] {
  return Object.values(OUTBOX_EVENT_TYPES);
}
