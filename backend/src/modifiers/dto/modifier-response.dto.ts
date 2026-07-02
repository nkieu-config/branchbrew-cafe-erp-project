import { ApiProperty } from '@nestjs/swagger';
import { IngredientSummaryDto } from '../../inventory/dto/inventory-response.dto';

export class ModifierGroupRefDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Milk options' })
  name: string;
}

export class ModifierOptionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 2 })
  groupId: number;

  @ApiProperty({ example: 'Oat milk' })
  name: string;

  @ApiProperty({ example: 15 })
  priceDelta: number;

  @ApiProperty({ example: false })
  isDefault: boolean;

  @ApiProperty({ example: 1 })
  sortOrder: number;

  @ApiProperty({ type: Number, example: 5, nullable: true })
  swapToIngredientId: number | null;

  @ApiProperty({ type: IngredientSummaryDto, required: false })
  swapToIngredient?: IngredientSummaryDto;

  @ApiProperty({ type: ModifierGroupRefDto, required: false })
  group?: ModifierGroupRefDto;
}

export class ModifierGroupResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Milk options' })
  name: string;

  @ApiProperty({ type: String, example: 'Coffee', nullable: true })
  category: string | null;

  @ApiProperty({ example: 0 })
  sortOrder: number;

  @ApiProperty({ type: Number, example: 3, nullable: true })
  swapIngredientId: number | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;

  @ApiProperty({ type: IngredientSummaryDto, required: false })
  swapIngredient?: IngredientSummaryDto;

  @ApiProperty({ type: ModifierOptionResponseDto, isArray: true })
  options: ModifierOptionResponseDto[];
}

export class ModifierDeleteResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: true })
  deleted: boolean;
}
