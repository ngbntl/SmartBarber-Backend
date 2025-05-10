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
import {
  CONFIRM_REGISTER_BY_ADMIN,
  MESSAGE,
} from 'src/common/constants/message';
import { StylistResponse, Stylists } from './types/stylists.type';
import { plainToClass, plainToInstance } from 'class-transformer';
import { RoleType } from 'src/common/constants/enum';
import { generateCustomString, generateUserId } from 'src/utils/function';
import { UsersService } from '../users/users.service';
import { PasswordService } from 'src/helpers/bcrypt.helper';
import { MailerService } from 'src/helpers/mailer.helper';

@Injectable()
export class StylistsService {
  constructor(
    @InjectRepository(UsersEntity)
    private userRepository: Repository<UsersEntity>,
    private usersService: UsersService,
    private passwordService: PasswordService,
    private mailerService: MailerService,
  ) {}

  async create(createStylistDto: CreateStylistDto): Promise<MessageResponse> {
    try {
      const email = createStylistDto.email?.toLocaleLowerCase();
      const user = await this.usersService.findByEmail(email);
      if (user) {
        throw new NotFoundException(MESSAGE.EMAIL_EXISTED);
      }
      const password = generateCustomString(8);
      const hashedPassword = this.passwordService.encryptPassword(
        generateCustomString(8),
      );
      const userId = generateUserId();
      const stylist = this.userRepository.create({
        ...createStylistDto,
        id: userId,
        roleType: RoleType.STYLIST,
        isActive: true,
        password: hashedPassword,
      });

      await this.userRepository.save(stylist);

      const html = CONFIRM_REGISTER_BY_ADMIN(
        'vi',
        createStylistDto.firstName + ' ' + createStylistDto.lastName,
        email,
        password,
      );

      this.mailerService.sendMail(email, html.titles, html.content);

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
