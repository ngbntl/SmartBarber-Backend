import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, Length, MaxLength } from 'class-validator';
import { Scope } from 'src/database/entities/clients.entity';

export class CreateClientDto {
  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  redirectUrl: string;
}
