import { ApiProperty } from '@nestjs/swagger';
import { ApiErrorCode } from '../errors/api-error-code.enum';

export class ApiErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ enum: ApiErrorCode, example: ApiErrorCode.VALIDATION_ERROR })
  code: ApiErrorCode;

  @ApiProperty({ example: 'Validation failed.' })
  message: string;

  @ApiProperty({ required: false, example: 'req-1234' })
  requestId?: string;

  @ApiProperty({ required: false, example: { field: 'email' } })
  details?: unknown;

  @ApiProperty({ example: '2026-07-02T08:01:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/orders/1/void' })
  path: string;
}

