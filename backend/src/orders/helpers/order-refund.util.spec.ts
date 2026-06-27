import { assertRefundable } from './order-refund.util';

describe('order-refund.util', () => {
  it('allows refund for completed orders from a previous day', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(() => assertRefundable(yesterday, 'COMPLETED')).not.toThrow();
  });

  it('rejects same-day refund', () => {
    expect(() => assertRefundable(new Date(), 'COMPLETED')).toThrow();
  });

  it('rejects refund for pending orders', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(() => assertRefundable(yesterday, 'PENDING')).toThrow();
  });

  it('rejects already refunded orders', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(() => assertRefundable(yesterday, 'REFUNDED')).toThrow();
  });

  it('throws REFUND_SAME_DAY for today completed orders', () => {
    try {
      assertRefundable(new Date(), 'COMPLETED');
    } catch (e) {
      expect((e as Error).message).toBe('REFUND_SAME_DAY');
    }
  });
});
