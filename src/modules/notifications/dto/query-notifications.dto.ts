import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../../../common/constants/enum';

export class QueryNotificationsDto {
  @ApiProperty({
    description: 'Lọc theo loại thông báo',
    enum: NotificationType,
    required: false,
  })
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @ApiProperty({
    description: 'Tìm kiếm theo nội dung hoặc tiêu đề',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;
}
