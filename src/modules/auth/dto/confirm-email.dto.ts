import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class ConfirmRegisterDto {
  @ApiProperty({
    example: '06ngb20@gmail.com',
    description: 'Email người dùng',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456', description: 'Mã OTP đã gửi' })
  @IsString()
  @Length(6, 6)
  @IsNotEmpty()
  otpCode: string;
}
