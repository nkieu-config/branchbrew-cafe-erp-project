import { OrderStatus } from '@prisma/client';

export class OrderStatusUpdatedEvent {
  constructor(
    public readonly orderId: number,
    public readonly status: OrderStatus,
    public readonly branchId: number,
  ) {}
}
