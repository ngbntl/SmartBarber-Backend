import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, Length, MaxLength } from 'class-validator';

export class UpdateClientDto {
  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  redirectUrl: string;
}
