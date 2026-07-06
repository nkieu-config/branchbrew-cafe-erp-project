import {
  dec,
  isBalancedMoney,
  roundMoney,
  roundUnitCost,
  sumMoney,
} from './decimal.util';

describe('decimal.util', () => {
  it('rounds money to 2 decimal places', () => {
    expect(roundMoney(99.995)).toBe(100);
    expect(roundMoney(10.004)).toBe(10);
  });

  it('rounds unit cost to 4 decimal places', () => {
    expect(roundUnitCost(0.12345)).toBe(0.1235);
  });

  it('requires journal balance to be exact — no cent tolerance', () => {
    expect(isBalancedMoney(100, 100)).toBe(true);
    expect(isBalancedMoney(100, 100.009)).toBe(false);
    expect(isBalancedMoney(100, 100.01)).toBe(false);
  });

  it('sums in decimal space without float drift', () => {
    expect(sumMoney([0.1, 0.2]).equals(dec(0.3))).toBe(true);
    expect(isBalancedMoney(sumMoney([0.1, 0.2]), 0.3)).toBe(true);
  });

  it('does decimal arithmetic free of float artifacts', () => {
    expect(dec('19.99').times(3).toNumber()).toBe(59.97);
  });
});
