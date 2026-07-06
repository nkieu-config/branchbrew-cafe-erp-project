import { toNum } from '../../common/decimal.util';

export const ORDER_LIFECYCLE_STATUSES = [
  'PENDING',
  'PREPARING',
  'COMPLETED',
  'CANCELLED',
  'REFUNDED',
] as const;

export type OrderLifecycleStatus = (typeof ORDER_LIFECYCLE_STATUSES)[number];

export const ORDER_PAYMENT_METHODS = [
  'CASH',
  'CREDIT_CARD',
  'QR_PROMPTPAY',
] as const;

export type OrderPaymentMethod = (typeof ORDER_PAYMENT_METHODS)[number];

export type OrderSnapshot = {
  id: number;
  branchId: number;
  status: OrderLifecycleStatus;
  paymentMethod: OrderPaymentMethod;
  netAmount: number;
  taxAmount: number;
  totalCogs: number;
  createdAt: Date;
};

type OrderSnapshotSource = {
  id: number;
  branchId: number;
  status: OrderLifecycleStatus;
  paymentMethod: OrderPaymentMethod;
  netAmount: number | string | { toNumber(): number } | null;
  taxAmount: number | string | { toNumber(): number } | null;
  totalCogs: number | string | { toNumber(): number } | null;
  createdAt: Date;
};

export function toOrderSnapshot(order: OrderSnapshotSource): OrderSnapshot {
  return {
    id: order.id,
    branchId: order.branchId,
    status: order.status,
    paymentMethod: order.paymentMethod,
    netAmount: toNum(order.netAmount),
    taxAmount: toNum(order.taxAmount),
    totalCogs: toNum(order.totalCogs),
    createdAt: order.createdAt,
  };
}
