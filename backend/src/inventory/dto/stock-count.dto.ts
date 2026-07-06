import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStockCountDto {
  @IsOptional()
  @IsBoolean()
  isBlind?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(1)
  notes?: string;
}

export class StockCountLineInputDto {
  @IsInt()
  @IsPositive()
  ingredientId: number;

  @IsNumber()
  @Min(0)
  countedQty: number;
}

export class UpdateStockCountLinesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockCountLineInputDto)
  lines: StockCountLineInputDto[];
}

export const MANUAL_ADJUSTMENT_REASONS = ['DAMAGE', 'CORRECTION'] as const;
export type ManualAdjustmentReason = (typeof MANUAL_ADJUSTMENT_REASONS)[number];

export class ManualAdjustmentDto {
  @IsInt()
  @IsPositive()
  ingredientId: number;

  @IsNumber()
  quantityDelta: number;

  @IsIn(MANUAL_ADJUSTMENT_REASONS)
  reason: ManualAdjustmentReason;

  @IsOptional()
  @IsString()
  @MinLength(1)
  notes?: string;
}
