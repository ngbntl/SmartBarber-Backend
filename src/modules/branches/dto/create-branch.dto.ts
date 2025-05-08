import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty({ description: 'Tên chi nhánh' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Địa chỉ chi nhánh' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'Thành phố' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Quận/Huyện' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ description: 'Số điện thoại', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Mô tả', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Hình ảnh chi nhánh', required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ description: 'Giờ mở cửa' })
  @IsString()
  @IsNotEmpty()
  openTime: string;

  @ApiProperty({ description: 'Giờ đóng cửa' })
  @IsString()
  @IsNotEmpty()
  closeTime: string;

  @ApiProperty({ description: 'Trạng thái hoạt động', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
