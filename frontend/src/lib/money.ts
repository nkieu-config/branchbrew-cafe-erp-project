/** Coerce API Decimal strings (or numbers) to a finite number. */
export function toNumber(value: number | string | null | undefined): number {
  if (value == null || value === '') return 0;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatMoney(
  value: number | string | null | undefined,
  decimals = 2,
): string {
  return toNumber(value).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export const DEFAULT_CURRENCY = "THB";

export function formatCurrency(
  value: number | string | null | undefined,
  currency: string = DEFAULT_CURRENCY,
): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toNumber(value));
}

export function formatCurrencyCompact(
  value: number | string | null | undefined,
  currency: string = DEFAULT_CURRENCY,
): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(toNumber(value));
}

