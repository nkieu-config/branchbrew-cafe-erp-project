import { IsInt, IsPositive } from 'class-validator';

export class ClockInDto {
  @IsInt()
  @IsPositive()
  branchId: number;
}
