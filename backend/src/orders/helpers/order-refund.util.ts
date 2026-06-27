import { OrderStatus } from '@prisma/client';
import {
  isSameCalendarDay,
  isTerminalOrderStatus,
} from '../order-void.util';

export function assertVoidable(createdAt: Date, status: OrderStatus): void {
  if (isTerminalOrderStatus(status)) {
    throw new Error('ORDER_ALREADY_REVERSED');
  }
  if (!isSameCalendarDay(createdAt, new Date())) {
    throw new Error('VOID_NOT_SAME_DAY');
  }
}

export function assertRefundable(createdAt: Date, status: OrderStatus): void {
  if (isTerminalOrderStatus(status)) {
    throw new Error('ORDER_ALREADY_REVERSED');
  }
  if (status !== 'COMPLETED') {
    throw new Error('REFUND_NOT_COMPLETED');
  }
  if (isSameCalendarDay(createdAt, new Date())) {
    throw new Error('REFUND_SAME_DAY');
  }
}
