import { ApiProperty } from '@nestjs/swagger';
import { EquipmentStatus, EquipmentType } from '@prisma/client';
import { BranchResponseDto } from '../../branches/dto/branch-response.dto';

export class MaintenanceLogResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 10 })
  equipmentId: number;

  @ApiProperty({ example: 'Replaced group gasket' })
  description: string;

  @ApiProperty({ example: 850 })
  cost: number;

  @ApiProperty({ type: String, example: 'TechServe Co.', nullable: true })
  performedBy: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  date: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}

export class EquipmentResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  branchId: number;

  @ApiProperty({ example: 'La Marzocco Linea' })
  name: string;

  @ApiProperty({ enum: EquipmentType, example: EquipmentType.ESPRESSO_MACHINE })
  type: EquipmentType;

  @ApiProperty({ type: String, example: 'LM-2024-001', nullable: true })
  serialNumber: string | null;

  @ApiProperty({ enum: EquipmentStatus, example: EquipmentStatus.ACTIVE })
  status: EquipmentStatus;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  purchaseDate: Date | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  warrantyExpiry: Date | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  nextMaintenanceDate: Date | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;

  @ApiProperty({ type: BranchResponseDto, required: false })
  branch?: BranchResponseDto;
}

export class EquipmentDetailResponseDto extends EquipmentResponseDto {
  @ApiProperty({ type: MaintenanceLogResponseDto, isArray: true, required: false })
  maintenanceLogs?: MaintenanceLogResponseDto[];
}
