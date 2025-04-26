import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStylistDto {
  @ApiProperty({ description: 'Tên thợ cắt tóc' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Họ thợ cắt tóc' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Đường dẫn ảnh đại diện', required: false })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ description: 'Thông tin giới thiệu', required: false })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ description: 'Chuyên môn', required: false })
  @IsString()
  @IsOptional()
  specialization?: string;

  @ApiProperty({
    description: 'Số năm kinh nghiệm',
    required: false,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  experienceYears?: number;

  @ApiProperty({ description: 'Trạng thái hoạt động', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'ID chi nhánh' })
  @IsString()
  branchId: string;
}
