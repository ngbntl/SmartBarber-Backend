import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Express } from 'express';

export class CreateHaircolorDto {
  @ApiProperty({ description: 'Tên màu tóc' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'URL hình ảnh màu tóc (được tự động cập nhật khi upload file)',
    required: false
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
  
  @ApiProperty({
    type: 'file',
    required: true,
    description: 'File ảnh màu tóc (JPG, JPEG, PNG, GIF tối đa 5MB)'
  })
  image?: Express.Multer.File;
}

export class UpdateHaircolorDto {
  @ApiProperty({ description: 'Tên màu tóc', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'URL hình ảnh màu tóc (được tự động cập nhật khi upload file)',
    required: false
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
  
  @ApiProperty({
    type: 'file',
    required: false,
    description: 'File ảnh màu tóc (JPG, JPEG, PNG, GIF tối đa 5MB)'
  })
  @IsOptional()
  image?: Express.Multer.File;
}

export class QueryHaircolorDto {
  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  limit?: number;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  offset?: number;
}
