import { StockAdjustedSnapshot } from '../domain/stock-adjusted.snapshot';

export class StockAdjustedEvent {
  constructor(public readonly payload: StockAdjustedSnapshot) {}

  get reference(): string {
    return this.payload.reference;
  }

  get branchId(): number {
    return this.payload.branchId;
  }

  get netVarianceValue(): number {
    return this.payload.netVarianceValue;
  }

  get description(): string {
    return this.payload.description;
  }
}
