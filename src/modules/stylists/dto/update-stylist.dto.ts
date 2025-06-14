import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStylistDto {
  @ApiProperty({ description: 'Tên thợ cắt tóc' })
  @IsString()
  @IsOptional()
  firstName: string;

  @ApiProperty({ description: 'Họ thợ cắt tóc' })
  @IsString()
  @IsOptional()
  lastName: string;

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

  @ApiProperty({ description: 'Số điện thoại', required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ description: 'ID chi nhánh' })
  @IsString()
  @IsOptional()
  branchId: string;
}
