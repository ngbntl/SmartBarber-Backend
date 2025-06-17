import { ApiProperty, ApiConsumes } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { Express } from 'express';

export class CreateHairstyleDto {
  @ApiProperty({ description: 'Tên kiểu tóc' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'URL hình ảnh kiểu tóc (được tự động cập nhật khi upload file)',
    required: false
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
  
  @ApiProperty({
    type: 'file',
    required: true,
    description: 'File ảnh kiểu tóc (JPG, JPEG, PNG, GIF tối đa 5MB)'
  })
  image?: Express.Multer.File;
}

export class UpdateHairstyleDto {
  @ApiProperty({ description: 'Tên kiểu tóc', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'URL hình ảnh kiểu tóc (được tự động cập nhật khi upload file)',
    required: false
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
  
  @ApiProperty({
    type: 'file',
    required: false,
    description: 'File ảnh kiểu tóc (JPG, JPEG, PNG, GIF tối đa 5MB)'
  })
  @IsOptional()
  image?: Express.Multer.File;
}

export class QueryHairstyleDto {
  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  limit?: number;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  offset?: number;
}
