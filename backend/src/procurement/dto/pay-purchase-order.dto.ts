import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { SupplierPaymentMethod } from '@prisma/client';

export class PayPurchaseOrderDto {
  @IsIn(Object.values(SupplierPaymentMethod))
  method: SupplierPaymentMethod;

  @IsOptional()
  @IsString()
  @MinLength(1)
  notes?: string;
}
