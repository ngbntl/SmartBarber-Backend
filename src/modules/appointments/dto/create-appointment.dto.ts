import { IsString, IsDate, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'ID người dùng' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'ID dịch vụ' })
  @IsString()
  serviceId: string;

  @ApiProperty({ description: 'ID chi nhánh' })
  @IsString()
  branchId: string;

  @ApiProperty({ description: 'ID thợ cắt tóc (tùy chọn)', required: false })
  @IsString()
  @IsOptional()
  stylistId?: string;

  @ApiProperty({ description: 'Ngày hẹn' })
  @Type(() => Date)
  @IsDate()
  appointmentDate: Date;

  @ApiProperty({ description: 'Giờ bắt đầu (định dạng: HH:MM)' })
  @IsString()
  startTime: string;

  @ApiProperty({ description: 'Tổng tiền', required: false })
  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @ApiProperty({ description: 'Số tiền giảm giá', required: false })
  @IsNumber()
  @IsOptional()
  discountAmount?: number;

  @ApiProperty({ description: 'ID khuyến mãi', required: false })
  @IsString()
  @IsOptional()
  promotionId?: string;

  @ApiProperty({ description: 'Ghi chú', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
