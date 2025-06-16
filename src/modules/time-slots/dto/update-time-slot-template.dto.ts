import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, Matches, IsOptional, IsBoolean } from 'class-validator';

export class UpdateTimeSlotTemplateDto {
  @ApiPropertyOptional({
    description: 'Thời gian bắt đầu (định dạng HH:MM hoặc HH:MM:SS)',
    example: '09:00',
  })
  @IsString()
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message:
      'Định dạng thời gian không hợp lệ. Sử dụng định dạng HH:MM hoặc HH:MM:SS',
  })
  startTime?: string;

  @ApiPropertyOptional({
    description: 'Thời gian kết thúc (định dạng HH:MM hoặc HH:MM:SS)',
    example: '10:00',
  })
  @IsString()
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message:
      'Định dạng thời gian không hợp lệ. Sử dụng định dạng HH:MM hoặc HH:MM:SS',
  })
  endTime?: string;

  @ApiPropertyOptional({
    description: 'Mô tả khung giờ',
    example: 'Buổi sáng',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái kích hoạt của khung giờ',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
