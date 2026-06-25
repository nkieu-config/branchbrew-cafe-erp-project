import { IsInt, IsPositive, IsString, IsISO8601 } from 'class-validator';

export class CreateShiftDto {
  @IsInt()
  @IsPositive()
  userId: number;

  @IsInt()
  @IsPositive()
  branchId: number;

  @IsString()
  @IsISO8601()
  startTime: string;

  @IsString()
  @IsISO8601()
  endTime: string;
}
