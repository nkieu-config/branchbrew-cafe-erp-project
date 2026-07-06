import { OrderSnapshot } from '../domain/order.snapshot';

export class OrderRefundedEvent {
  constructor(
    public readonly order: OrderSnapshot,
    public readonly reason?: string,
  ) {}
}
