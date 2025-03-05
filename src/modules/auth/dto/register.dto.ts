import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @MinLength(2)
  @MaxLength(64)
  firstName: string;

  @ApiProperty()
  @MinLength(2)
  @MaxLength(64)
  lastName: string;

  @ApiProperty()
  @IsEmail()
  @MinLength(5)
  @MaxLength(50)
  email: string;

  @ApiProperty()
  @IsOptional()
  @MinLength(8)
  @MaxLength(25)
  password: string;
}
