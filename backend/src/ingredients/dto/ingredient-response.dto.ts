import { ApiProperty } from '@nestjs/swagger';
import { SupplierResponseDto } from '../../procurement/dto/procurement-response.dto';

export class IngredientResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Whole milk' })
  name: string;

  @ApiProperty({ example: 'L' })
  unit: string;

  @ApiProperty({ example: 45 })
  costPerUnit: number;

  @ApiProperty({ type: Number, example: 2, nullable: true })
  primarySupplierId: number | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;

  @ApiProperty({ type: SupplierResponseDto, required: false })
  primarySupplier?: SupplierResponseDto;
}

export class SyncIngredientInventoryResponseDto {
  @ApiProperty({ example: 3 })
  ingredientId: number;

  @ApiProperty({ example: 4 })
  rowsCreated: number;
}

export class BranchInventoryWithIngredientResponseDto {
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

  @ApiProperty({ type: IngredientResponseDto, required: false })
  ingredient?: IngredientResponseDto;
}
