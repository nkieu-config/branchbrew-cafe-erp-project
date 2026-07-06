export type StockAdjustedSnapshot = {
  reference: string;
  branchId: number;
  netVarianceValue: number;
  description: string;
};

export function toStockAdjustedSnapshot(input: {
  reference: string;
  branchId: number;
  netVarianceValue: number;
  description: string;
}): StockAdjustedSnapshot {
  return {
    reference: input.reference,
    branchId: input.branchId,
    netVarianceValue: input.netVarianceValue,
    description: input.description,
  };
}
