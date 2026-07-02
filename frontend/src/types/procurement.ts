import type { components } from './generated/api';

export type Supplier = components['schemas']['SupplierResponseDto'];

export type PurchaseOrder = components['schemas']['PurchaseOrderResponseDto'];

export type PurchaseOrderItem =
  components['schemas']['PurchaseOrderItemResponseDto'];
