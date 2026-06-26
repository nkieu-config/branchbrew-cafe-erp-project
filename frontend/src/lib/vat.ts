import { toNumber } from './money';

/** VAT/tax embedded in an inclusive net total. */
export function inclusiveTaxAmount(
  netInclusive: number | string,
  ratePercent: number | string,
): number {
  const net = toNumber(netInclusive);
  const rate = toNumber(ratePercent);
  if (rate <= 0 || net <= 0) return 0;
  return (net * rate) / (100 + rate);
}

export function parseVatRatePercent(value: unknown): number {
  const n = toNumber(typeof value === 'string' || typeof value === 'number' ? value : 7);
  return n >= 0 ? n : 7;
}
