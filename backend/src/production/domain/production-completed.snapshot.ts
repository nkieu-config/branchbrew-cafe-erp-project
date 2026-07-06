export type ProductionCompletedSnapshot = {
  orderNumber: string;
  targetIngredientName: string;
  branchId: number;
  totalRawCost: number;
  finishedGoodsValue: number;
};

export function toProductionCompletedSnapshot(input: {
  orderNumber: string;
  targetIngredientName: string;
  branchId: number;
  totalRawCost: number;
  finishedGoodsValue: number;
}): ProductionCompletedSnapshot {
  return {
    orderNumber: input.orderNumber,
    targetIngredientName: input.targetIngredientName,
    branchId: input.branchId,
    totalRawCost: input.totalRawCost,
    finishedGoodsValue: input.finishedGoodsValue,
  };
}
