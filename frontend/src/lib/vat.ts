import { toNumber } from './money';

const NET_SCALE = 10_000;
const RATE_SCALE = 1_000;
const CENTS = 100;

function halfUpDiv(numerator: number, denominator: number): number {
  return Math.floor((2 * numerator + denominator) / (2 * denominator));
}

export function inclusiveTaxAmount(
  netInclusive: number | string,
  ratePercent: number | string,
): number {
  const net = toNumber(netInclusive);
  const rate = toNumber(ratePercent);
  if (rate <= 0 || net <= 0) return 0;

  const netScaled = Math.round(net * NET_SCALE);
  const rateScaled = Math.round(rate * RATE_SCALE);
  const numerator = netScaled * rateScaled;
  const denominator = CENTS * (100 * RATE_SCALE + rateScaled);

  if (!Number.isSafeInteger(numerator)) {
    return Math.round((net * rate * CENTS) / (100 + rate)) / CENTS;
  }

  return halfUpDiv(numerator, denominator) / CENTS;
}

export function parseVatRatePercent(value: unknown): number {
  const n = toNumber(typeof value === 'string' || typeof value === 'number' ? value : 7);
  return n >= 0 ? n : 7;
}
