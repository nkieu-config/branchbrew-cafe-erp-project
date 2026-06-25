import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  isCentralKitchen?: boolean;
}
