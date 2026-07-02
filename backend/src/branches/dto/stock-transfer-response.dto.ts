import { ApiProperty } from '@nestjs/swagger';
import { TransferStatus } from '@prisma/client';
import { BranchResponseDto } from './branch-response.dto';
import { IngredientResponseDto } from '../../ingredients/dto/ingredient-response.dto';
import { HrUserSummaryDto } from '../../hr/dto/hr-response.dto';

export class StockTransferResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  fromBranchId: number;

  @ApiProperty({ example: 2 })
  toBranchId: number;

  @ApiProperty({ example: 3 })
  ingredientId: number;

  @ApiProperty({ example: 12 })
  quantity: number;

  @ApiProperty({ enum: TransferStatus, example: TransferStatus.PENDING })
  status: TransferStatus;

  @ApiProperty({ example: 4 })
  requestedById: number;

  @ApiProperty({ type: Number, example: 5, nullable: true })
  approvedById: number | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;

  @ApiProperty({ type: BranchResponseDto, required: false })
  fromBranch?: BranchResponseDto;

  @ApiProperty({ type: BranchResponseDto, required: false })
  toBranch?: BranchResponseDto;

  @ApiProperty({ type: IngredientResponseDto, required: false })
  ingredient?: IngredientResponseDto;

  @ApiProperty({ type: HrUserSummaryDto, required: false })
  requestedBy?: HrUserSummaryDto;
}
