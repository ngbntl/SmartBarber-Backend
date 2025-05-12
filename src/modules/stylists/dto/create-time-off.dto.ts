import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTimeOffDto {
  @ApiProperty({
    description: 'ID của stylist',
    example: 'e12d3456-7890-abcd-ef12-3456789abcde',
  })
  @IsNotEmpty({ message: 'ID stylist không được để trống' })
  @IsString()
  stylistId: string;

  @ApiProperty({
    description: 'Ngày nghỉ (định dạng YYYY-MM-DD)',
    example: '2025-05-15',
  })
  @IsNotEmpty({ message: 'Ngày nghỉ không được để trống' })
  @IsString()
  date: string;

  @ApiProperty({
    description: 'Thời gian bắt đầu nghỉ (HH:MM:SS), để trống nếu nghỉ cả ngày',
    example: '09:00:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({
    description:
      'Thời gian kết thúc nghỉ (HH:MM:SS), để trống nếu nghỉ cả ngày',
    example: '12:00:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiProperty({
    description: 'Lý do nghỉ',
    example: 'Nghỉ ốm',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
