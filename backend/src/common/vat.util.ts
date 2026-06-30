import { roundMoney } from './decimal.util';

/** VAT/tax embedded in an inclusive net total (e.g. 7% VAT in 107 → 7). */
export function inclusiveTaxAmount(
  netInclusive: number,
  ratePercent: number,
): number {
  if (ratePercent <= 0 || netInclusive <= 0) return 0;
  return roundMoney((netInclusive * ratePercent) / (100 + ratePercent));
}

export function parseVatRatePercent(raw: string | null | undefined): number {
  const n = parseFloat(raw ?? '7');
  return Number.isFinite(n) && n >= 0 ? n : 7;
}
