import type { components } from './generated/api';

export type Ingredient = components['schemas']['IngredientResponseDto'];

export type BranchInventoryWithIngredient =
  components['schemas']['BranchInventoryWithIngredientResponseDto'];

export type SyncIngredientInventoryResult =
  components['schemas']['SyncIngredientInventoryResponseDto'];
