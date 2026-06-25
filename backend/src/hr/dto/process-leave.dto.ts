import { IsEnum } from 'class-validator';
import { LeaveStatus } from '@prisma/client';

export class ProcessLeaveDto {
  @IsEnum(LeaveStatus)
  status: LeaveStatus;
}
