import { ApiProperty } from '@nestjs/swagger';
import { BatchStatus } from '@prisma/client';

export class IngredientSummaryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Whole milk' })
  name: string;

  @ApiProperty({ example: 'L' })
  unit: string;

  @ApiProperty({ example: 45, required: false })
  costPerUnit?: number;
}

export class BranchInventoryResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  branchId: number;

  @ApiProperty({ example: 3 })
  ingredientId: number;

  @ApiProperty({ example: 24.5 })
  stock: number;

  @ApiProperty({ example: 10 })
  minStock: number;

  @ApiProperty({ type: String, format: 'date-time', required: false })
  updatedAt?: Date;

  @ApiProperty({ type: IngredientSummaryDto, required: false })
  ingredient?: IngredientSummaryDto;
}

export class InventoryBatchResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  branchId: number;

  @ApiProperty({ example: 3 })
  ingredientId: number;

  @ApiProperty({ example: 12 })
  quantity: number;

  @ApiProperty({ type: String, format: 'date-time', nullable: true, required: false })
  expiryDate?: Date | null;

  @ApiProperty({ type: Number, nullable: true, required: false })
  poId?: number | null;

  @ApiProperty({ enum: BatchStatus, example: BatchStatus.ACTIVE })
  status: BatchStatus;

  @ApiProperty({ type: String, format: 'date-time', required: false })
  createdAt?: Date;

  @ApiProperty({ type: String, format: 'date-time', required: false })
  updatedAt?: Date;
}

export class WasteLogRecordedByDto {
  @ApiProperty({ type: String, example: 'Branch Manager', nullable: true })
  name: string | null;
}

export class WasteLogResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  branchId: number;

  @ApiProperty({ example: 3 })
  ingredientId: number;

  @ApiProperty({ example: 2.5 })
  quantity: number;

  @ApiProperty({ example: 'Expired batch disposal' })
  reason: string;

  @ApiProperty({ example: 4 })
  recordedById: number;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: IngredientSummaryDto, required: false })
  ingredient?: IngredientSummaryDto;

  @ApiProperty({ type: WasteLogRecordedByDto, required: false })
  recordedBy?: WasteLogRecordedByDto;
}

export class StockInResultDto {
  @ApiProperty({ type: InventoryBatchResponseDto })
  batch: InventoryBatchResponseDto;

  @ApiProperty({ type: BranchInventoryResponseDto })
  inventory: BranchInventoryResponseDto;
}
