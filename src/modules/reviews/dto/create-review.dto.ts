import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsUUID, IsOptional, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ description: 'ID lịch hẹn được đánh giá' })
  @IsUUID()
  appointmentId: string;

  @ApiProperty({
    description: 'Điểm đánh giá tổng thể (1-5)',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'Nhận xét đánh giá', required: false })
  @IsString()
  @IsOptional()
  comment?: string;
}
