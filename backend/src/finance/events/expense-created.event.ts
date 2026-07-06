import { ExpenseCreatedSnapshot } from '../domain/expense-created.snapshot';

export class ExpenseCreatedEvent {
  constructor(public readonly payload: ExpenseCreatedSnapshot) {}

  get expenseId(): number {
    return this.payload.expenseId;
  }

  get branchId(): number {
    return this.payload.branchId;
  }

  get amount(): number {
    return this.payload.amount;
  }

  get category(): string {
    return this.payload.category;
  }
}
