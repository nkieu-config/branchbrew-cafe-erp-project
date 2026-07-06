import { Prisma } from '@prisma/client';

type DecimalLike = { toNumber(): number };

export type MoneyInput =
  | number
  | string
  | Prisma.Decimal
  | DecimalLike
  | null
  | undefined;

export const MONEY_SCALE = 2;
export const UNIT_COST_SCALE = 4;

export function dec(value: MoneyInput): Prisma.Decimal {
  if (value == null) return new Prisma.Decimal(0);
  if (value instanceof Prisma.Decimal) return value;
  if (typeof value === 'number' || typeof value === 'string') {
    return new Prisma.Decimal(value);
  }
  if (typeof value.toNumber === 'function') {
    return new Prisma.Decimal(value.toNumber());
  }
  return new Prisma.Decimal(0);
}

export function toNum(value: MoneyInput): number {
  return dec(value).toNumber();
}

export function roundMoney(value: MoneyInput): number {
  return dec(value).toDecimalPlaces(MONEY_SCALE).toNumber();
}

export function roundUnitCost(value: MoneyInput): number {
  return dec(value).toDecimalPlaces(UNIT_COST_SCALE).toNumber();
}

export function sumMoney(values: MoneyInput[]): Prisma.Decimal {
  return values.reduce<Prisma.Decimal>(
    (sum, value) => sum.plus(dec(value).toDecimalPlaces(MONEY_SCALE)),
    new Prisma.Decimal(0),
  );
}

export function isBalancedMoney(
  debits: MoneyInput,
  credits: MoneyInput,
): boolean {
  return dec(debits)
    .toDecimalPlaces(MONEY_SCALE)
    .equals(dec(credits).toDecimalPlaces(MONEY_SCALE));
}
