import { PurchaseOrderPaidSnapshot } from '../domain/purchase-order-paid.snapshot';

export class PurchaseOrderPaidEvent {
  constructor(public readonly payload: PurchaseOrderPaidSnapshot) {}

  get poId(): number {
    return this.payload.poId;
  }

  get poNumber(): string {
    return this.payload.poNumber;
  }

  get branchId(): number {
    return this.payload.branchId;
  }

  get amount(): number {
    return this.payload.amount;
  }

  get method(): string {
    return this.payload.method;
  }
}
