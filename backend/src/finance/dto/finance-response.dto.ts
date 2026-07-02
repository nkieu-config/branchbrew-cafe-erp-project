import { ApiProperty } from '@nestjs/swagger';
import { SettlementStatus } from '@prisma/client';

export class ExpenseRecordedByDto {
  @ApiProperty({ type: String, example: 'Branch Manager', nullable: true })
  name: string | null;
}

export class ExpenseResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  branchId: number;

  @ApiProperty({ example: 250 })
  amount: number;

  @ApiProperty({ example: 'Supplies' })
  category: string;

  @ApiProperty({ type: String, example: 'Cleaning supplies', nullable: true })
  description: string | null;

  @ApiProperty({ example: 4 })
  recordedById: number;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: ExpenseRecordedByDto, required: false })
  recordedBy?: ExpenseRecordedByDto;
}

export class SettlementExpectedResponseDto {
  @ApiProperty({ example: 12500 })
  expectedCash: number;

  @ApiProperty({ example: 8200 })
  expectedCreditCard: number;

  @ApiProperty({ example: 3100 })
  expectedQR: number;

  @ApiProperty({ example: 12500 })
  sales: number;

  @ApiProperty({ example: 450 })
  expenses: number;
}

export class SettlementBranchSummaryDto {
  @ApiProperty({ example: 'Downtown' })
  name: string;
}

export class SettlementSubmittedByDto {
  @ApiProperty({ type: String, example: 'Jane Staff', nullable: true })
  name: string | null;
}

export class SettlementResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  branchId: number;

  @ApiProperty({ type: String, format: 'date' })
  date: Date;

  @ApiProperty({ example: 12500 })
  expectedCash: number;

  @ApiProperty({ example: 12480 })
  actualCash: number;

  @ApiProperty({ example: 8200 })
  expectedCreditCard: number;

  @ApiProperty({ example: 8200 })
  actualCreditCard: number;

  @ApiProperty({ example: 3100 })
  expectedQR: number;

  @ApiProperty({ example: 3100 })
  actualQR: number;

  @ApiProperty({ example: -20 })
  difference: number;

  @ApiProperty({ enum: SettlementStatus, example: SettlementStatus.PENDING })
  status: SettlementStatus;

  @ApiProperty({ example: 4 })
  submittedById: number;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;

  @ApiProperty({ type: SettlementBranchSummaryDto, required: false })
  branch?: SettlementBranchSummaryDto;

  @ApiProperty({ type: SettlementSubmittedByDto, required: false })
  submittedBy?: SettlementSubmittedByDto;
}
