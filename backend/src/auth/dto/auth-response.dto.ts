import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class AuthUserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'manager@branchbrew.dev' })
  email: string;

  @ApiProperty({ type: String, example: 'Branch Manager', nullable: true })
  name: string | null;

  @ApiProperty({ enum: Role, example: Role.MANAGER })
  role: Role;

  @ApiProperty({ type: Number, example: 1, nullable: true })
  branchId: number | null;

  @ApiProperty({ type: String, example: 'Downtown', nullable: true })
  branch: string | null;
}

export class AuthLoginResponseDto {
  @ApiProperty({ type: AuthUserResponseDto })
  user: AuthUserResponseDto;
}
