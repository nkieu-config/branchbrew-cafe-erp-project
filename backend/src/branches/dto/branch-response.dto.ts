import { ApiProperty } from '@nestjs/swagger';

export class BranchResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Downtown' })
  name: string;

  @ApiProperty({ type: String, example: 'Bangkok', nullable: true })
  location: string | null;

  @ApiProperty({ example: false })
  isCentralKitchen: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}

export class SyncBranchInventoryResponseDto {
  @ApiProperty({ example: 1 })
  branchId: number;

  @ApiProperty({ example: 12 })
  rowsCreated: number;
}
