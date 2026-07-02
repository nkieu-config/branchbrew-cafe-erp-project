import { ApiProperty } from '@nestjs/swagger';
import { IngredientSummaryDto } from '../../inventory/dto/inventory-response.dto';

export class RecipeItemResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 10 })
  productId: number;

  @ApiProperty({ example: 3 })
  ingredientId: number;

  @ApiProperty({ example: 0.25 })
  quantity: number;

  @ApiProperty({ type: IngredientSummaryDto, required: false })
  ingredient?: IngredientSummaryDto;
}

export class ProductResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Latte' })
  name: string;

  @ApiProperty({ example: 120 })
  price: number;

  @ApiProperty({ example: 'Coffee' })
  category: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;

  @ApiProperty({ type: RecipeItemResponseDto, isArray: true, required: false })
  recipeItems?: RecipeItemResponseDto[];
}
