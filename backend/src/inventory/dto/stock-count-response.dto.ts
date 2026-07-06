import { ApiProperty } from '@nestjs/swagger';
import { StockAdjustmentReason, StockCountStatus } from '@prisma/client';
import { IngredientSummaryDto } from './inventory-response.dto';

export class StockCountUserDto {
  @ApiProperty({ type: String, example: 'Branch Manager', nullable: true })
  name: string | null;
}

export class StockCountLineResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 3 })
  ingredientId: number;

  @ApiProperty({ type: Number, nullable: true, required: false })
  expectedQty?: number | null;

  @ApiProperty({ type: Number, nullable: true, required: false })
  countedQty?: number | null;

  @ApiProperty({
    type: Number,
    nullable: true,
    required: false,
    description:
      'Live stock at read time; hidden while a blind count is in draft',
  })
  currentStock?: number | null;

  @ApiProperty({ type: IngredientSummaryDto, required: false })
  ingredient?: IngredientSummaryDto;
}

export class StockCountResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  branchId: number;

  @ApiProperty({ enum: StockCountStatus, example: StockCountStatus.DRAFT })
  status: StockCountStatus;

  @ApiProperty({ example: false })
  isBlind: boolean;

  @ApiProperty({ type: String, nullable: true, required: false })
  notes?: string | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
    required: false,
  })
  submittedAt?: Date | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
    required: false,
  })
  approvedAt?: Date | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: StockCountUserDto, required: false })
  createdBy?: StockCountUserDto;

  @ApiProperty({ type: StockCountUserDto, nullable: true, required: false })
  approvedBy?: StockCountUserDto | null;

  @ApiProperty({
    type: StockCountLineResponseDto,
    isArray: true,
    required: false,
  })
  lines?: StockCountLineResponseDto[];
}

export class StockAdjustmentResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  branchId: number;

  @ApiProperty({ example: 3 })
  ingredientId: number;

  @ApiProperty({ example: -2.5 })
  quantityDelta: number;

  @ApiProperty({
    enum: StockAdjustmentReason,
    example: StockAdjustmentReason.COUNT_VARIANCE,
  })
  reason: StockAdjustmentReason;

  @ApiProperty({ type: String, nullable: true, required: false })
  notes?: string | null;

  @ApiProperty({ type: Number, nullable: true, required: false })
  stockCountId?: number | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: IngredientSummaryDto, required: false })
  ingredient?: IngredientSummaryDto;

  @ApiProperty({ type: StockCountUserDto, required: false })
  createdBy?: StockCountUserDto;
}
