import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EmergencyCancelDto {
  @ApiProperty({
    description: 'Lý do khẩn cấp phải hủy lịch hẹn',
    example: 'Tôi bị ốm đột xuất và không thể làm việc hôm nay',
  })
  @IsNotEmpty({ message: 'Vui lòng cung cấp lý do hủy lịch' })
  @IsString({ message: 'Lý do hủy phải là chuỗi ký tự' })
  emergencyReason: string;
}
