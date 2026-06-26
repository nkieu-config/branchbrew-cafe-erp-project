import { Order } from '@prisma/client';

export class OrderVoidedEvent {
  constructor(public readonly order: Order) {}
}
