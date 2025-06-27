import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in-progress',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no-show',
}

export class UpdateAppointmentStatusDto {
  @ApiProperty({
    description: 'Trạng thái mới của lịch hẹn',
    enum: AppointmentStatus,
  })
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;

  @ApiProperty({
    description: 'Ghi chú khi cập nhật trạng thái (tùy chọn)',
    required: false,
  })
  @IsString()
  @IsOptional()
  note?: string;
}
