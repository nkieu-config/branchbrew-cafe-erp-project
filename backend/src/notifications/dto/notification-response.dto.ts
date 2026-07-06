import { ApiProperty } from '@nestjs/swagger';
import { NotificationType, Role } from '@prisma/client';

export class NotificationResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ enum: NotificationType, example: NotificationType.LOW_STOCK })
  type: NotificationType;

  @ApiProperty({ example: 'Espresso Beans is running low' })
  title: string;

  @ApiProperty({ type: String, nullable: true, required: false })
  body?: string | null;

  @ApiProperty({ type: String, nullable: true, required: false })
  link?: string | null;

  @ApiProperty({ type: Number, nullable: true, required: false })
  branchId?: number | null;

  @ApiProperty({ enum: Role, example: Role.MANAGER })
  minRole: Role;

  @ApiProperty({ type: Number, nullable: true, required: false })
  userId?: number | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
    required: false,
  })
  readAt?: Date | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;
}

export class MarkAllReadResponseDto {
  @ApiProperty({ example: 4 })
  updated: number;
}
