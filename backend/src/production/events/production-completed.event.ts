import { ProductionCompletedSnapshot } from '../domain/production-completed.snapshot';

export class ProductionCompletedEvent {
  constructor(public readonly payload: ProductionCompletedSnapshot) {}

  get orderNumber(): string {
    return this.payload.orderNumber;
  }

  get targetIngredientName(): string {
    return this.payload.targetIngredientName;
  }

  get branchId(): number {
    return this.payload.branchId;
  }

  get totalRawCost(): number {
    return this.payload.totalRawCost;
  }
}
