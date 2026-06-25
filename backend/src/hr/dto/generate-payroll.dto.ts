import { IsInt, IsPositive, Max, Min } from 'class-validator';

export class GeneratePayrollDto {
  @IsInt()
  @IsPositive()
  branchId: number;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;
}
