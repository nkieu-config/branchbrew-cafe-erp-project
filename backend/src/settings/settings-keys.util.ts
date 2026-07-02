/** Map frontend camelCase keys ↔ DB snake_case keys. */
export const SETTINGS_KEY_MAP = {
  companyName: 'company_name',
  taxId: 'tax_id',
  vatRate: 'vat_rate',
  currency: 'currency',
  receiptFooter: 'receipt_footer',
} as const;

export type SettingsCamelKey = keyof typeof SETTINGS_KEY_MAP;
export type SettingsDbKey = (typeof SETTINGS_KEY_MAP)[SettingsCamelKey];
export type SettingsKnownInput = Partial<Record<SettingsCamelKey, string>>;
export type SettingsUpdateInput = SettingsKnownInput & Record<string, string>;
export type SettingsReadable = Record<string, string>;
export type DbSettingsMap = Record<string, string>;

const DB_TO_CAMEL: Record<SettingsDbKey, SettingsCamelKey> = {
  company_name: 'companyName',
  tax_id: 'taxId',
  vat_rate: 'vatRate',
  currency: 'currency',
  receipt_footer: 'receiptFooter',
};

function isSettingsCamelKey(key: string): key is SettingsCamelKey {
  return key in SETTINGS_KEY_MAP;
}

function isSettingsDbKey(key: string): key is SettingsDbKey {
  return key in DB_TO_CAMEL;
}

export function toDbSettings(data: SettingsUpdateInput): DbSettingsMap {
  const out: DbSettingsMap = {};
  for (const [key, value] of Object.entries(data)) {
    const dbKey =
      (isSettingsCamelKey(key) ? SETTINGS_KEY_MAP[key] : undefined) ??
      key.replace(/([A-Z])/g, '_$1').toLowerCase();
    out[dbKey] = value;
  }
  return out;
}

export function fromDbSettings(data: DbSettingsMap): SettingsReadable {
  const out: SettingsReadable = {};
  for (const [key, value] of Object.entries(data)) {
    out[isSettingsDbKey(key) ? DB_TO_CAMEL[key] : key] = value;
  }
  return out;
}
