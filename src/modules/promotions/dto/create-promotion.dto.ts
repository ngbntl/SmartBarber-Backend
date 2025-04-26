import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsDate,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePromotionDto {
  @ApiProperty({ description: 'Tên khuyến mãi' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Mô tả khuyến mãi' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Số tiền giảm giá', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  discountAmount?: number;

  @ApiProperty({ description: 'Phần trăm giảm giá (%)', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @ApiProperty({
    description: 'Sử dụng phần trăm giảm giá thay vì số tiền cố định',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPercentage?: boolean;

  @ApiProperty({ description: 'Ngày bắt đầu khuyến mãi' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ description: 'Ngày kết thúc khuyến mãi' })
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiProperty({ description: 'Trạng thái khuyến mãi', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Mã khuyến mãi (nếu có)', required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    description: 'Giới hạn sử dụng (-1 = không giới hạn)',
    default: -1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  usageLimit?: number;

  @ApiProperty({ description: 'Giá trị đơn hàng tối thiểu', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minimumPurchaseAmount?: number;

  @ApiProperty({
    description: 'Danh sách ID dịch vụ được áp dụng',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  applicableServiceIds?: string[];

  @ApiProperty({ description: 'Ảnh khuyến mãi', required: false })
  @IsString()
  @IsOptional()
  image?: string;
}
