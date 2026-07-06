import type { components } from './generated/api';

export type BranchInventory =
  components['schemas']['BranchInventoryResponseDto'];

export type InventoryBatch =
  components['schemas']['InventoryBatchResponseDto'];

export type WasteLog = components['schemas']['WasteLogResponseDto'];

export type StockInResult = components['schemas']['StockInResultDto'];

export type IngredientSummary =
  components['schemas']['IngredientSummaryDto'];

export type StockCount = components['schemas']['StockCountResponseDto'] & {
  branch?: { name: string };
  _count?: { lines: number; adjustments: number };
};

export type StockCountLine =
  components['schemas']['StockCountLineResponseDto'];

export type StockAdjustment =
  components['schemas']['StockAdjustmentResponseDto'];
