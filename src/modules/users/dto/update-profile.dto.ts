import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ required: false, description: 'First name' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  firstName?: string;

  @ApiProperty({ required: false, description: 'Last name' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  lastName?: string;

  @ApiProperty({ required: false, description: 'Bio/Description' })
  @IsOptional()
  @IsString()
  bio?: string;
}
