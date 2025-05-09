import {
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from '../../database/entities/users.entity';
import { CreateStylistDto } from './dto/create-stylist.dto';
import { MessageResponse } from 'src/common/types/response';
import { MESSAGE } from 'src/common/constants/message';
import { StylistResponse, Stylists } from './types/stylists.type';
import { plainToClass, plainToInstance } from 'class-transformer';
import { RoleType } from 'src/common/constants/enum';

@Injectable()
export class StylistsService {
  constructor(
    @InjectRepository(UsersEntity)
    private userRepository: Repository<UsersEntity>,
  ) {}

  async create(createStylistDto: CreateStylistDto): Promise<MessageResponse> {
    try {
      // Tạo user với role là STYLIST
      const stylist = this.userRepository.create({
        ...createStylistDto,
        roleType: RoleType.STYLIST,
        isActive: true,
      });

      await this.userRepository.save(stylist);

      return {
        statusCode: HttpStatus.CREATED,
        message: MESSAGE.STYLIST_CREATE_SUCCESS,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll(): Promise<Stylists> {
    try {
      const [stylists, total] = await this.userRepository.findAndCount({
        where: {
          roleType: RoleType.STYLIST,
          isActive: true,
        },
      });

      const items = plainToInstance(StylistResponse, stylists, {
        excludeExtraneousValues: true,
      });
      return { items, total };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string): Promise<StylistResponse> {
    try {
      const stylist = await this.userRepository.findOne({
        where: {
          id,
          roleType: RoleType.STYLIST,
        },
      });

      if (!stylist) {
        throw new NotFoundException(MESSAGE.STYLIST_NOT_FOUND);
      }

      return plainToClass(StylistResponse, stylist, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw error;
    }
  }
}
