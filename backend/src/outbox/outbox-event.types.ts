import { Order, OrderStatus, Prisma } from '@prisma/client';

export const OUTBOX_EVENT_TYPES = {
  ORDER_CREATED: 'order.created',
  ORDER_STATUS_UPDATED: 'order.status.updated',
  ORDER_VOIDED: 'order.voided',
  ORDER_REFUNDED: 'order.refunded',
  PURCHASE_ORDER_RECEIVED: 'purchase-order.received',
  PRODUCTION_COMPLETED: 'production.completed',
} as const;

export type OutboxEventType =
  (typeof OUTBOX_EVENT_TYPES)[keyof typeof OUTBOX_EVENT_TYPES];

export type OutboxEventPayloadMap = {
  [OUTBOX_EVENT_TYPES.ORDER_CREATED]: {
    order: Order;
    ingredientRequirements: [number, number][];
    branchId: number;
    customerId: number | null;
  };
  [OUTBOX_EVENT_TYPES.ORDER_STATUS_UPDATED]: {
    orderId: number;
    status: OrderStatus;
    branchId: number;
  };
  [OUTBOX_EVENT_TYPES.ORDER_VOIDED]: {
    order: Order;
  };
  [OUTBOX_EVENT_TYPES.ORDER_REFUNDED]: {
    order: Order;
    reason?: string;
  };
  [OUTBOX_EVENT_TYPES.PURCHASE_ORDER_RECEIVED]: {
    poId: number;
    poNumber: string;
    branchId: number;
    totalAmount: number;
  };
  [OUTBOX_EVENT_TYPES.PRODUCTION_COMPLETED]: {
    orderNumber: string;
    targetIngredientName: string;
    branchId: number;
    totalRawCost: number;
  };
};

export type OutboxEventPayload<T extends OutboxEventType> =
  OutboxEventPayloadMap[T];

export type OutboxEnqueuePayload = {
  [K in OutboxEventType]: {
    eventType: K;
    payload: OutboxEventPayloadMap[K];
  };
}[OutboxEventType];

export function isOutboxEventType(value: string): value is OutboxEventType {
  return Object.values(OUTBOX_EVENT_TYPES).includes(value as OutboxEventType);
}

export function assertOutboxPayload<T extends OutboxEventType>(
  eventType: T,
  payload: unknown,
): OutboxEventPayload<T> {
  if (payload == null || typeof payload !== 'object') {
    throw new Error(`Outbox payload for ${eventType} must be an object.`);
  }

  const data = payload as Record<string, unknown>;

  switch (eventType) {
    case OUTBOX_EVENT_TYPES.ORDER_CREATED: {
      assertNumber(data.branchId, `${eventType}.branchId`);
      if (data.customerId != null) {
        assertNumber(data.customerId, `${eventType}.customerId`);
      }
      if (!Array.isArray(data.ingredientRequirements)) {
        throw new Error(`${eventType}.ingredientRequirements must be an array.`);
      }
      if (data.order == null || typeof data.order !== 'object') {
        throw new Error(`${eventType}.order is required.`);
      }
      return payload as OutboxEventPayload<T>;
    }
    case OUTBOX_EVENT_TYPES.ORDER_STATUS_UPDATED: {
      assertNumber(data.orderId, `${eventType}.orderId`);
      assertNumber(data.branchId, `${eventType}.branchId`);
      assertString(data.status, `${eventType}.status`);
      return payload as OutboxEventPayload<T>;
    }
    case OUTBOX_EVENT_TYPES.ORDER_VOIDED:
    case OUTBOX_EVENT_TYPES.ORDER_REFUNDED: {
      if (data.order == null || typeof data.order !== 'object') {
        throw new Error(`${eventType}.order is required.`);
      }
      if (data.reason != null) {
        assertString(data.reason, `${eventType}.reason`);
      }
      return payload as OutboxEventPayload<T>;
    }
    case OUTBOX_EVENT_TYPES.PURCHASE_ORDER_RECEIVED: {
      assertNumber(data.poId, `${eventType}.poId`);
      assertNumber(data.branchId, `${eventType}.branchId`);
      assertNumber(data.totalAmount, `${eventType}.totalAmount`);
      assertString(data.poNumber, `${eventType}.poNumber`);
      return payload as OutboxEventPayload<T>;
    }
    case OUTBOX_EVENT_TYPES.PRODUCTION_COMPLETED: {
      assertNumber(data.branchId, `${eventType}.branchId`);
      assertNumber(data.totalRawCost, `${eventType}.totalRawCost`);
      assertString(data.orderNumber, `${eventType}.orderNumber`);
      assertString(
        data.targetIngredientName,
        `${eventType}.targetIngredientName`,
      );
      return payload as OutboxEventPayload<T>;
    }
    default: {
      const _exhaustive: never = eventType;
      throw new Error(`Unhandled outbox event type: ${String(_exhaustive)}`);
    }
  }
}

function assertNumber(value: unknown, field: string): asserts value is number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`${field} must be a number.`);
  }
}

function assertString(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${field} must be a non-empty string.`);
  }
}

export function toOutboxJsonValue<T extends OutboxEventType>(
  payload: OutboxEventPayload<T>,
): Prisma.InputJsonValue {
  return payload as Prisma.InputJsonValue;
}
