import { ApiProperty } from '@nestjs/swagger';
import { DiscountType } from '@prisma/client';

export class PromotionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'SUMMER10' })
  code: string;

  @ApiProperty({ example: '10% off summer drinks' })
  description: string;

  @ApiProperty({ enum: DiscountType, example: DiscountType.PERCENTAGE })
  discountType: DiscountType;

  @ApiProperty({ example: 10 })
  discountValue: number;

  @ApiProperty({ type: Number, example: 500, nullable: true })
  minPurchase: number | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  startDate: Date | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  endDate: Date | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}

export class ValidatePromotionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'SUMMER10' })
  code: string;

  @ApiProperty({ example: 85 })
  discountAmount: number;

  @ApiProperty({ enum: DiscountType, example: DiscountType.PERCENTAGE })
  type: DiscountType;

  @ApiProperty({ example: 10 })
  value: number;
}
