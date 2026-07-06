import { ApiProperty } from '@nestjs/swagger';
import { ProductionStatus } from '@prisma/client';
import { BranchResponseDto } from '../../branches/dto/branch-response.dto';
import { IngredientResponseDto } from '../../ingredients/dto/ingredient-response.dto';

export class ProductionOrderResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'PRD-000042' })
  orderNumber: string;

  @ApiProperty({ example: 2 })
  branchId: number;

  @ApiProperty({ example: 5 })
  targetIngredientId: number;

  @ApiProperty({ example: 50 })
  quantityToProduce: number;

  @ApiProperty({ enum: ProductionStatus, example: ProductionStatus.PLANNED })
  status: ProductionStatus;

  @ApiProperty({ example: 1250 })
  actualCost: number;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  plannedStartDate: Date | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  completedAt: Date | null;

  @ApiProperty({ type: Number, example: 4, nullable: true })
  createdByUserId: number | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;

  @ApiProperty({ type: BranchResponseDto, required: false })
  branch?: BranchResponseDto;

  @ApiProperty({ type: IngredientResponseDto, required: false })
  targetIngredient?: IngredientResponseDto;
}

export class ProductionBomResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 5 })
  targetIngredientId: number;

  @ApiProperty({ example: 3 })
  rawIngredientId: number;

  @ApiProperty({ example: 0.25 })
  quantityNeeded: number;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;

  @ApiProperty({ type: IngredientResponseDto, required: false })
  targetIngredient?: IngredientResponseDto;

  @ApiProperty({ type: IngredientResponseDto, required: false })
  rawIngredient?: IngredientResponseDto;
}
