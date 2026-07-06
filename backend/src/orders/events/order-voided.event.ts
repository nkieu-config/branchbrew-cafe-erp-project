import { OrderSnapshot } from '../domain/order.snapshot';

export class OrderVoidedEvent {
  constructor(public readonly order: OrderSnapshot) {}
}
