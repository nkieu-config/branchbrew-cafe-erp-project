import { Prisma } from '@prisma/client';
import {
  ORDER_LIFECYCLE_STATUSES,
  OrderLifecycleStatus,
  OrderSnapshot,
} from '../orders/domain/order-snapshot';
import { PurchaseOrderReceivedSnapshot } from '../procurement/domain/purchase-order-received.snapshot';
import { ProductionCompletedSnapshot } from '../production/domain/production-completed.snapshot';

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
    order: OrderSnapshot;
    ingredientRequirements: [number, number][];
    branchId: number;
    customerId: number | null;
  };
  [OUTBOX_EVENT_TYPES.ORDER_STATUS_UPDATED]: {
    orderId: number;
    status: OrderLifecycleStatus;
    branchId: number;
  };
  [OUTBOX_EVENT_TYPES.ORDER_VOIDED]: {
    order: OrderSnapshot;
  };
  [OUTBOX_EVENT_TYPES.ORDER_REFUNDED]: {
    order: OrderSnapshot;
    reason?: string;
  };
  [OUTBOX_EVENT_TYPES.PURCHASE_ORDER_RECEIVED]: {
    purchaseOrder: PurchaseOrderReceivedSnapshot;
  };
  [OUTBOX_EVENT_TYPES.PRODUCTION_COMPLETED]: {
    production: ProductionCompletedSnapshot;
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

type OutboxEventValidatorMap = {
  [K in OutboxEventType]: (payload: unknown) => OutboxEventPayload<K>;
};

const outboxPayloadValidators: OutboxEventValidatorMap = {
  [OUTBOX_EVENT_TYPES.ORDER_CREATED]: (payload) => {
    const eventType = OUTBOX_EVENT_TYPES.ORDER_CREATED;
    const data = asObject(payload, eventType);
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
    return data as OutboxEventPayload<typeof eventType>;
  },
  [OUTBOX_EVENT_TYPES.ORDER_STATUS_UPDATED]: (payload) => {
    const eventType = OUTBOX_EVENT_TYPES.ORDER_STATUS_UPDATED;
    const data = asObject(payload, eventType);
    assertNumber(data.orderId, `${eventType}.orderId`);
    assertNumber(data.branchId, `${eventType}.branchId`);
    assertOrderStatus(data.status, `${eventType}.status`);
    return data as OutboxEventPayload<typeof eventType>;
  },
  [OUTBOX_EVENT_TYPES.ORDER_VOIDED]: (payload) => {
    const eventType = OUTBOX_EVENT_TYPES.ORDER_VOIDED;
    const data = asObject(payload, eventType);
    if (data.order == null || typeof data.order !== 'object') {
      throw new Error(`${eventType}.order is required.`);
    }
    return data as OutboxEventPayload<typeof eventType>;
  },
  [OUTBOX_EVENT_TYPES.ORDER_REFUNDED]: (payload) => {
    const eventType = OUTBOX_EVENT_TYPES.ORDER_REFUNDED;
    const data = asObject(payload, eventType);
    if (data.order == null || typeof data.order !== 'object') {
      throw new Error(`${eventType}.order is required.`);
    }
    if (data.reason != null) {
      assertString(data.reason, `${eventType}.reason`);
    }
    return data as OutboxEventPayload<typeof eventType>;
  },
  [OUTBOX_EVENT_TYPES.PURCHASE_ORDER_RECEIVED]: (payload) => {
    const eventType = OUTBOX_EVENT_TYPES.PURCHASE_ORDER_RECEIVED;
    const data = asObject(payload, eventType);
    const purchaseOrder = readObject(
      data.purchaseOrder,
      `${eventType}.purchaseOrder`,
    );
    assertNumber(purchaseOrder.poId, `${eventType}.purchaseOrder.poId`);
    assertNumber(purchaseOrder.branchId, `${eventType}.purchaseOrder.branchId`);
    assertNumber(
      purchaseOrder.totalAmount,
      `${eventType}.purchaseOrder.totalAmount`,
    );
    assertString(
      purchaseOrder.poNumber,
      `${eventType}.purchaseOrder.poNumber`,
    );
    return data as OutboxEventPayload<typeof eventType>;
  },
  [OUTBOX_EVENT_TYPES.PRODUCTION_COMPLETED]: (payload) => {
    const eventType = OUTBOX_EVENT_TYPES.PRODUCTION_COMPLETED;
    const data = asObject(payload, eventType);
    const production = readObject(data.production, `${eventType}.production`);
    assertNumber(production.branchId, `${eventType}.production.branchId`);
    assertNumber(
      production.totalRawCost,
      `${eventType}.production.totalRawCost`,
    );
    assertString(production.orderNumber, `${eventType}.production.orderNumber`);
    assertString(
      production.targetIngredientName,
      `${eventType}.production.targetIngredientName`,
    );
    return data as OutboxEventPayload<typeof eventType>;
  },
};

export function assertOutboxPayload<T extends OutboxEventType>(
  eventType: T,
  payload: unknown,
): OutboxEventPayload<T> {
  return outboxPayloadValidators[eventType](payload);
}

function asObject(
  payload: unknown,
  eventType: OutboxEventType,
): Record<string, unknown> {
  if (payload == null || typeof payload !== 'object') {
    throw new Error(`Outbox payload for ${eventType} must be an object.`);
  }
  return payload as Record<string, unknown>;
}

function readObject(value: unknown, field: string): Record<string, unknown> {
  if (value == null || typeof value !== 'object') {
    throw new Error(`${field} must be an object.`);
  }
  return value as Record<string, unknown>;
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

function assertOrderStatus(
  value: unknown,
  field: string,
): asserts value is OrderLifecycleStatus {
  const statuses = ORDER_LIFECYCLE_STATUSES;
  if (
    typeof value !== 'string' ||
    !statuses.some((status) => status === value)
  ) {
    throw new Error(
      `${field} must be one of: ${statuses.join(', ')}.`,
    );
  }
}

export function toOutboxJsonValue<T extends OutboxEventType>(
  payload: OutboxEventPayload<T>,
): Prisma.InputJsonValue {
  return payload as Prisma.InputJsonValue;
}
