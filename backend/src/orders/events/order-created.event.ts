import { OrderSnapshot } from '../domain/order-snapshot';

export class OrderCreatedEvent {
  constructor(
    public readonly order: OrderSnapshot,
    public readonly ingredientRequirements: Map<number, number>,
    public readonly branchId: number,
    public readonly customerId: number | null,
  ) {}
}
