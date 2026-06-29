import type { Product } from "@/types/api";

export type PosCartItem = {
  id: string;
  product: Product;
  quantity: number;
  notes?: string;
  modifierOptionIds?: number[];
  unitPrice: number;
};
