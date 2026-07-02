import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class AuditLogUserSummaryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ type: String, example: 'Jane Staff', nullable: true })
  name: string | null;

  @ApiProperty({ example: 'manager@branchbrew.dev' })
  email: string;

  @ApiProperty({ enum: Role, example: Role.MANAGER })
  role: Role;
}

export class AuditLogResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 4 })
  userId: number;

  @ApiProperty({ example: 'APPROVE_PO' })
  action: string;

  @ApiProperty({ example: 'PurchaseOrder' })
  targetType: string;

  @ApiProperty({ type: Number, example: 10, nullable: true })
  targetId: number | null;

  @ApiProperty({
    type: String,
    example: '{"poNumber":"PO-2026-0001"}',
    nullable: true,
  })
  details: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: AuditLogUserSummaryDto, required: false })
  user?: AuditLogUserSummaryDto;
}
