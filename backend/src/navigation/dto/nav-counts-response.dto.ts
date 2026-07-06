import { ApiProperty } from '@nestjs/swagger';

export class NavCountsResponseDto {
  @ApiProperty({ example: 1, nullable: true })
  branchId: number | null;

  @ApiProperty({ example: 4 })
  lowStock: number;

  @ApiProperty({ example: 2 })
  expiringBatches: number;

  @ApiProperty({ example: 3 })
  pendingTransfers: number;

  @ApiProperty({ example: 6 })
  kdsOrders: number;

  @ApiProperty({ example: 1 })
  pendingPurchaseOrders: number;

  @ApiProperty({ example: 1 })
  pendingSettlements: number;

  @ApiProperty({ example: 0 })
  pendingLeave: number;

  @ApiProperty({ example: 1 })
  pendingStockCounts: number;

  @ApiProperty({ example: 3 })
  unreadNotifications: number;
}
