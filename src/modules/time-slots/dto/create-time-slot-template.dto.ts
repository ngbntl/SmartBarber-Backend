import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, IsOptional } from 'class-validator';

export class CreateTimeSlotTemplateDto {
  @ApiProperty({
    description: 'Thời gian bắt đầu (định dạng HH:MM hoặc HH:MM:SS)',
    example: '09:00',
  })
  @IsString()
  @IsNotEmpty({ message: 'Thời gian bắt đầu không được để trống' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message:
      'Định dạng thời gian không hợp lệ. Sử dụng định dạng HH:MM hoặc HH:MM:SS',
  })
  startTime: string;

  @ApiProperty({
    description: 'Thời gian kết thúc (định dạng HH:MM hoặc HH:MM:SS)',
    example: '10:00',
  })
  @IsString()
  @IsNotEmpty({ message: 'Thời gian kết thúc không được để trống' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message:
      'Định dạng thời gian không hợp lệ. Sử dụng định dạng HH:MM hoặc HH:MM:SS',
  })
  endTime: string;

  @ApiPropertyOptional({
    description: 'Mô tả khung giờ',
    example: 'Buổi sáng',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
