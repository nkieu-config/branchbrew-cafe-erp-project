import { IsInt, IsNumber, IsPositive } from 'class-validator';

export class CreateTransferDto {
  @IsInt()
  @IsPositive()
  fromBranchId: number;

  @IsInt()
  @IsPositive()
  toBranchId: number;

  @IsInt()
  @IsPositive()
  ingredientId: number;

  @IsNumber()
  @IsPositive()
  quantity: number;
}
