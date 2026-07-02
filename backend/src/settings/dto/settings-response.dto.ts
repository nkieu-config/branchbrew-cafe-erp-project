import { ApiProperty } from '@nestjs/swagger';

export class SettingsResponseDto {
  @ApiProperty({ type: String, example: 'BranchBrew Co.', required: false })
  companyName?: string;

  @ApiProperty({ type: String, example: '0105551234567', required: false })
  taxId?: string;

  @ApiProperty({ type: String, example: '7', required: false })
  vatRate?: string;

  @ApiProperty({ type: String, example: 'THB', required: false })
  currency?: string;

  @ApiProperty({
    type: String,
    example: 'Thank you for visiting BranchBrew',
    required: false,
  })
  receiptFooter?: string;
}
