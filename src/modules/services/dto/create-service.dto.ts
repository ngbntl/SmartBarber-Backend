import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ description: 'Tên dịch vụ' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Mô tả dịch vụ' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Giá dịch vụ' })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Thời gian thực hiện (phút)' })
  @IsNumber()
  duration: number;

  @ApiProperty({ description: 'Hình ảnh dịch vụ', required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ description: 'Trạng thái hoạt động', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
