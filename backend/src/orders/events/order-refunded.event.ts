import { Order } from '@prisma/client';

export class OrderRefundedEvent {
  constructor(
    public readonly order: Order,
    public readonly reason?: string,
  ) {}
}
