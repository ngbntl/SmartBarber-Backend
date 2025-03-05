import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateNewAccessTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  refreshToken: string;
}
