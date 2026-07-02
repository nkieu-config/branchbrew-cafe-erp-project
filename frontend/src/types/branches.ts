import type { components } from './generated/api';

export type Branch = components['schemas']['BranchResponseDto'];

export type StockTransfer = components['schemas']['StockTransferResponseDto'];

export type SyncBranchInventoryResult =
  components['schemas']['SyncBranchInventoryResponseDto'];
