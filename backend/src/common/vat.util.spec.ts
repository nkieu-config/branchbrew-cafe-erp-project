import { inclusiveTaxAmount, parseVatRatePercent } from './vat.util';

describe('vat.util', () => {
  it('computes inclusive VAT', () => {
    expect(inclusiveTaxAmount(107, 7)).toBe(7);
    expect(inclusiveTaxAmount(100, 0)).toBe(0);
  });

  it('parses VAT rate with fallback', () => {
    expect(parseVatRatePercent('7')).toBe(7);
    expect(parseVatRatePercent(undefined)).toBe(7);
    expect(parseVatRatePercent('bad')).toBe(7);
  });
});
