import { OrderStatus } from '@prisma/client';

const KITCHEN_CATEGORIES = /coffee|beverage|drink|tea/i;

export function productRequiresKitchen(category: string): boolean {
  return KITCHEN_CATEGORIES.test(category);
}

export function resolveInitialOrderStatus(
  products: { category: string }[],
): 'PENDING' | 'COMPLETED' {
  return products.some((p) => productRequiresKitchen(p.category))
    ? 'PENDING'
    : 'COMPLETED';
}

const FORWARD_TRANSITIONS: Partial<
  Record<OrderStatus, readonly OrderStatus[]>
> = {
  PENDING: ['PREPARING', 'COMPLETED'],
  PREPARING: ['COMPLETED'],
};

export function canTransitionOrderStatus(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  return FORWARD_TRANSITIONS[from]?.includes(to) ?? false;
}
