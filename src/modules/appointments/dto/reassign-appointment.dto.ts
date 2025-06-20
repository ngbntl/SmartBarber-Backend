import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReassignAppointmentDto {
  @ApiProperty({
    description: 'ID của stylist mới sẽ đảm nhận lịch hẹn',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsNotEmpty({ message: 'ID của stylist mới là bắt buộc' })
  @IsString({ message: 'ID của stylist phải là một chuỗi' })
  newStylistId: string;

  @ApiProperty({
    description: 'Lý do chuyển giao lịch hẹn cho stylist khác',
    example: 'Stylist gốc có việc đột xuất và không thể thực hiện lịch hẹn này',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Lý do phải là một chuỗi' })
  reason?: string;
}
