import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { plainToClass } from 'class-transformer';
import { UserResponse } from './types/user.types';
import { JwtAuth } from 'src/common/decorators/jwt-auth.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MessageResponse } from 'src/common/types/response';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadAvatarResponseDto } from './dto/upload-avatar.dto';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
@JwtAuth()
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('me')
  async getMyself(@Req() req: any): Promise<UserResponse> {
    const { userLogged } = req;
    const userData = plainToClass(UserResponse, userLogged, {
      excludeExtraneousValues: true,
    });
    return userData;
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(
    @User() currentUser: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<MessageResponse> {
    return await this.userService.updateProfile(
      currentUser.id,
      updateProfileDto,
    );
  }

  @Post('avatar')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @User() currentUser: any,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadAvatarResponseDto> {
    const avatarUrl = await this.userService.uploadAvatar(currentUser.id, file);
    return { avatarUrl };
  }
}
