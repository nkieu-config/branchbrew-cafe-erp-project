/** Map frontend camelCase keys ↔ DB snake_case keys. */
export const SETTINGS_KEY_MAP = {
  companyName: 'company_name',
  taxId: 'tax_id',
  vatRate: 'vat_rate',
  currency: 'currency',
  receiptFooter: 'receipt_footer',
} as const;

export type SettingsCamelKey = keyof typeof SETTINGS_KEY_MAP;

const DB_TO_CAMEL = Object.fromEntries(
  Object.entries(SETTINGS_KEY_MAP).map(([camel, snake]) => [snake, camel]),
) as Record<string, SettingsCamelKey>;

export function toDbSettings(
  data: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    const dbKey =
      SETTINGS_KEY_MAP[key as SettingsCamelKey] ?? key.replace(/([A-Z])/g, '_$1').toLowerCase();
    out[dbKey] = value;
  }
  return out;
}

export function fromDbSettings(
  data: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    out[DB_TO_CAMEL[key] ?? key] = value;
  }
  return out;
}
