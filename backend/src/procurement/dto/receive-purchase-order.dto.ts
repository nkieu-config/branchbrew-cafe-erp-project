import {
  IsArray,
  IsISO8601,
  IsInt,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReceivePOItemDto {
  @IsInt()
  ingredientId: number;

  @IsOptional()
  @IsISO8601()
  expiryDate?: string;
}

export class ReceivePurchaseOrderDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceivePOItemDto)
  items?: ReceivePOItemDto[];
}
