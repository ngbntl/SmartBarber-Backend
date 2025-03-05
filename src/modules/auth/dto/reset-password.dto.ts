import { ApiProperty } from '@nestjs/swagger';
import { MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty()
  @MinLength(8)
  @MaxLength(25)
  password: string;

  @ApiProperty()
  token: string;
}
