export type PurchaseOrderPaidSnapshot = {
  poId: number;
  poNumber: string;
  branchId: number;
  amount: number;
  method: string;
};

export function toPurchaseOrderPaidSnapshot(input: {
  poId: number;
  poNumber: string;
  branchId: number;
  amount: number;
  method: string;
}): PurchaseOrderPaidSnapshot {
  return {
    poId: input.poId,
    poNumber: input.poNumber,
    branchId: input.branchId,
    amount: input.amount,
    method: input.method,
  };
}
