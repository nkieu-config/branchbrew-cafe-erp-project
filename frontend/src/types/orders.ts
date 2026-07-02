import type { components } from './generated/api';

export type Order = components['schemas']['OrderResponseDto'];

export type OrderItem = components['schemas']['OrderItemResponseDto'];

export type OrderItemModifier =
  components['schemas']['OrderItemModifierResponseDto'];

export type OrderProductSummary =
  components['schemas']['OrderProductSummaryDto'];

export type OrderPromotionSummary =
  components['schemas']['OrderPromotionSummaryDto'];
