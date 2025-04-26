import {
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stylist } from '../../database/entities/stylist.entity';
import { CreateStylistDto } from './dto/create-stylist.dto';
import { MessageResponse } from 'src/common/types/response';
import { MESSAGE } from 'src/common/constants/message';
import { StylistResponse, Stylists } from './types/stylists.type';
import { plainToClass, plainToInstance } from 'class-transformer';

@Injectable()
export class StylistsService {
  constructor(
    @InjectRepository(Stylist)
    private stylistRepository: Repository<Stylist>,
  ) {}

  async create(createStylistDto: CreateStylistDto): Promise<MessageResponse> {
    try {
      const stylist = this.stylistRepository.create(createStylistDto);
      await this.stylistRepository.save(stylist);

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
      const [stylists, total] = await this.stylistRepository.findAndCount({
        where: { isActive: true },
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
      const stylist = await this.stylistRepository.findOne({ where: { id } });
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
