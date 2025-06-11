import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../../../common/constants/enum';

export class CreateNotificationDto {
  @ApiProperty({ description: 'ID người dùng nhận thông báo' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Tiêu đề thông báo' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Nội dung thông báo' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'Loại thông báo', enum: NotificationType })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @ApiProperty({ description: 'ID tham chiếu (nếu có)', required: false })
  @IsString()
  @IsOptional()
  referenceId?: string;
}
