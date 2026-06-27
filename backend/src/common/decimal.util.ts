type DecimalLike = { toNumber(): number };

export const MONEY_SCALE = 2;
export const UNIT_COST_SCALE = 4;
const MONEY_EPSILON = 0.01;

export function toNum(
  value: number | string | DecimalLike | null | undefined,
): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value);
  if (
    typeof value === 'object' &&
    value !== null &&
    'toNumber' in value &&
    typeof value.toNumber === 'function'
  ) {
    return value.toNumber();
  }
  return Number(value);
}

export function roundMoney(value: number): number {
  const factor = 10 ** MONEY_SCALE;
  return Math.round(value * factor) / factor;
}

export function roundUnitCost(value: number): number {
  const factor = 10 ** UNIT_COST_SCALE;
  return Math.round(value * factor) / factor;
}

export function isBalancedMoney(debits: number, credits: number): boolean {
  return Math.abs(debits - credits) <= MONEY_EPSILON;
}
