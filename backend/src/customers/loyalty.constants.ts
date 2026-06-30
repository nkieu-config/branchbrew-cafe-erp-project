/** Loyalty program: 10 points redeem for one currency unit discount. */
export const POINTS_PER_CURRENCY_UNIT = 10;

export function pointsToDiscountAmount(points: number): number {
  return points / POINTS_PER_CURRENCY_UNIT;
}
