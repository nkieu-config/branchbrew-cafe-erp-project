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

/**
 * Format a non-currency quantity (stock, hours, variance) with grouped
 * thousands and an optional unit suffix — the numeric counterpart to
 * formatCurrency for values that should never carry a currency symbol.
 */
export function formatQuantity(
  value: number | string | null | undefined,
  options: { decimals?: number; unit?: string } = {},
): string {
  const { decimals = 2, unit } = options;
  const formatted = toNumber(value).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return unit ? `${formatted} ${unit}` : formatted;
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

