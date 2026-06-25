import { IsInt, IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export class SubmitSettlementDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  branchId?: number;

  @IsNumber()
  @Min(0)
  actualCash: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  actualCreditCard?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  actualQR?: number;
}
