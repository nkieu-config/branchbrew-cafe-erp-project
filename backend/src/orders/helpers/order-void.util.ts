export { buildIngredientRequirementsFromOrderItems } from './recipe-requirements.helper';

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isTerminalOrderStatus(
  status: 'PENDING' | 'PREPARING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED',
): boolean {
  return status === 'CANCELLED' || status === 'REFUNDED';
}
