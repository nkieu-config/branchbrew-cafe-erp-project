import { ApiProperty } from '@nestjs/swagger';

export class HealthOkResponseDto {
  @ApiProperty({ example: 'ok' })
  status: 'ok';
}

export class HealthErrorResponseDto {
  @ApiProperty({ example: 'error' })
  status: 'error';

  @ApiProperty({ example: 'Database unreachable' })
  message: string;
}
