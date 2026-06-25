import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';
import { LeaveType } from '@prisma/client';

export class RequestLeaveDto {
  @IsEnum(LeaveType)
  type: LeaveType;

  @IsISO8601()
  startDate: string;

  @IsISO8601()
  endDate: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
