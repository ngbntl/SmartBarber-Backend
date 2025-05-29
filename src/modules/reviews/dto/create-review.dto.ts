import {
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DetailedRatingDto {
  @ApiProperty({
    description: 'Loại đánh giá (overall, cleanliness, value, service, etc.)',
    example: 'cleanliness',
  })
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Điểm đánh giá (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  score: number;
}

export class CreateReviewDto {
  @ApiProperty({
    description: 'ID của stylist được đánh giá',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  })
  @IsUUID()
  stylistId: string;

  @ApiProperty({
    description: 'ID của chi nhánh (nếu có)',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiProperty({
    description: 'ID của lịch hẹn liên quan đến đánh giá (nếu có)',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @ApiProperty({
    description: 'Đánh giá sao (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Nội dung đánh giá',
    example: 'Dịch vụ rất tốt, nhân viên thân thiện',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({
    description: 'Danh sách ảnh đính kèm (URL)',
    example: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @ApiProperty({
    description: 'Các đánh giá chi tiết',
    type: [DetailedRatingDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetailedRatingDto)
  detailedRatings?: DetailedRatingDto[];
}