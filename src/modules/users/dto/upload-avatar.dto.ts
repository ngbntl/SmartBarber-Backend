import { ApiProperty } from '@nestjs/swagger';

export class UploadAvatarResponseDto {
  @ApiProperty({ description: 'avatar URL' })
  avatarUrl: string;
}
