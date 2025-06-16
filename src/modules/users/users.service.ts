import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from 'src/database/entities/users.entity';
import { DeepPartial, Repository } from 'typeorm';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MESSAGE } from 'src/common/constants/message';
import { MessageResponse } from 'src/common/types/response';
import { CloudinaryService } from 'src/helpers/cloudinary.helper';
import { UserResponse, Users } from './types/user.types';
import { plainToInstance } from 'class-transformer';
import { RoleType } from 'src/common/constants/enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRes: Repository<UsersEntity>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(): Promise<Users> {
    const [users, total] = await this.userRes.findAndCount({
      where: { roleType: RoleType.USER },
    });

    const items = plainToInstance(UserResponse, users, {
      excludeExtraneousValues: true,
    });

    return {
      items: items,
      total: total,
    };
  }
  async findByEmail(email: string): Promise<UsersEntity> {
    return await this.userRes.findOne({ where: { email } });
  }

  async updateUsers(users: DeepPartial<UsersEntity>[]): Promise<void> {
    await this.userRes.save(users);
  }

  async findById(id: string): Promise<UsersEntity> {
    const user = await this.userRes.findOne({
      where: { id },
    });
    return user;
  }

  async save(user: DeepPartial<UsersEntity>): Promise<UsersEntity> {
    return await this.userRes.save(user);
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<MessageResponse> {
    try {
      const user = await this.findById(userId);

      if (!user) {
        throw new BadRequestException(MESSAGE.USER_NOT_FOUND);
      }

      Object.keys(updateProfileDto).forEach((key) => {
        if (updateProfileDto[key] !== undefined) {
          user[key] = updateProfileDto[key];
        }
      });

      user.updatedAt = new Date().getTime();

      const result = await this.save(user);

      if (!result) {
        throw new BadRequestException(MESSAGE.UPDATE_USER_FAIL);
      }

      return {
        statusCode: 200,
        message: MESSAGE.UPDATE_USER_SUCCESS,
      };
    } catch (error) {
      throw error;
    }
  }

  async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    try {
      const user = await this.findById(userId);

      if (!user) {
        throw new BadRequestException(MESSAGE.USER_NOT_FOUND);
      }

      const result = await this.cloudinaryService.uploadImage(
        file,
        'smartbarber/avatars',
      );

      const avatarUrl = result;

      if (user.avatar) {
        try {
          const publicId = this.extractPublicIdFromUrl(user.avatar);
          if (publicId) {
            await this.cloudinaryService.deleteImage(publicId);
          }
        } catch (error) {
          console.error('Failed to delete old avatar:', error);
        }
      }

      user.avatar = avatarUrl;
      user.lastPictureUpdate = new Date().getTime();
      user.updatedAt = new Date().getTime();

      await this.save(user);

      return avatarUrl;
    } catch (error) {
      throw error;
    }
  }

  private extractPublicIdFromUrl(url: string): string | null {
    try {
      const urlParts = url.split('/');
      const uploadIndex = urlParts.findIndex((part) => part === 'upload');

      if (uploadIndex === -1 || uploadIndex + 2 >= urlParts.length) {
        return null;
      }

      const pathWithoutExtension = urlParts.slice(uploadIndex + 2).join('/');

      return pathWithoutExtension.replace(/\.[^/.]+$/, '');
    } catch (error) {
      console.error('Error extracting public ID from URL:', error);
      return null;
    }
  }
}
