import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  assertOutboxPayload,
  isOutboxEventType,
  OUTBOX_EVENT_TYPES,
} from './outbox-event.types';
import { dispatchOutboxEvent } from './outbox-event.registry';

describe('outbox-event.registry', () => {
  const eventEmitter = { emitAsync: jest.fn().mockResolvedValue([]) };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects unknown event types', async () => {
    await expect(
      dispatchOutboxEvent(
        'unknown.event',
        {},
        eventEmitter as unknown as EventEmitter2,
      ),
    ).rejects.toThrow('Unhandled outbox event type: unknown.event');
  });

  it('validates purchase-order.received payloads', () => {
    expect(() =>
      assertOutboxPayload(OUTBOX_EVENT_TYPES.PURCHASE_ORDER_RECEIVED, {
        poId: 1,
        poNumber: 'PO-000001',
        branchId: 2,
        totalAmount: 100,
      }),
    ).not.toThrow();

    expect(() =>
      assertOutboxPayload(OUTBOX_EVENT_TYPES.PURCHASE_ORDER_RECEIVED, {
        poId: 'bad',
      }),
    ).toThrow('purchase-order.received.poId must be a number.');
  });

  it('dispatches order.status.updated to the event bus', async () => {
    await dispatchOutboxEvent(
      OUTBOX_EVENT_TYPES.ORDER_STATUS_UPDATED,
      { orderId: 9, status: 'COMPLETED', branchId: 2 },
      eventEmitter as unknown as EventEmitter2,
    );

    expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
      OUTBOX_EVENT_TYPES.ORDER_STATUS_UPDATED,
      expect.objectContaining({
        orderId: 9,
        status: 'COMPLETED',
        branchId: 2,
      }),
    );
  });

  it('recognizes all registered event types', () => {
    for (const eventType of Object.values(OUTBOX_EVENT_TYPES)) {
      expect(isOutboxEventType(eventType)).toBe(true);
    }
    expect(isOutboxEventType('not.registered')).toBe(false);
  });
});
