import type { components } from './generated/api';

export type Expense = components['schemas']['ExpenseResponseDto'];

export type Settlement = components['schemas']['SettlementResponseDto'];

export type SettlementExpected =
  components['schemas']['SettlementExpectedResponseDto'];
