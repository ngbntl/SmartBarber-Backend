import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateNotificationDto } from './create-notification.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  @ApiProperty({ description: 'Trạng thái đã đọc thông báo', required: false })
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;
}
