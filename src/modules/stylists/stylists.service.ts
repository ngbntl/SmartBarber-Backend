import {
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { UsersEntity } from '../../database/entities/users.entity';
import { CreateStylistDto } from './dto/create-stylist.dto';
import { MessageResponse } from 'src/common/types/response';
import {
  CONFIRM_REGISTER_BY_ADMIN,
  MESSAGE,
} from 'src/common/constants/message';
import {
  StylistResponse,
  Stylists,
  WeeklySchedule,
  DailySchedule,
} from './types/stylists.type';
import { plainToClass, plainToInstance } from 'class-transformer';
import { RoleType } from 'src/common/constants/enum';
import { generateCustomString, generateUserId } from 'src/utils/function';
import { UsersService } from '../users/users.service';
import { PasswordService } from 'src/helpers/bcrypt.helper';
import { MailerService } from 'src/helpers/mailer.helper';
import { StylistSchedule } from '../../database/entities/stylist-schedule.entity';
import { StylistTimeOff } from '../../database/entities/stylist-time-off.entity';

@Injectable()
export class StylistsService {
  constructor(
    @InjectRepository(UsersEntity)
    private userRepository: Repository<UsersEntity>,
    private usersService: UsersService,
    private passwordService: PasswordService,
    private mailerService: MailerService,
    private entityManager: EntityManager,
  ) {}

  async create(createStylistDto: CreateStylistDto): Promise<MessageResponse> {
    try {
      const email = createStylistDto.email?.toLocaleLowerCase();
      const user = await this.usersService.findByEmail(email);
      if (user) {
        throw new NotFoundException(MESSAGE.EMAIL_EXISTED);
      }
      const password = generateCustomString(8);
      const hashedPassword = this.passwordService.encryptPassword(password);
      const userId = generateUserId();
      const stylist = this.userRepository.create({
        ...createStylistDto,
        id: userId,
        createAt: new Date().getTime(),
        updateAt: new Date().getTime(),
        roleType: RoleType.STYLIST,
        isActive: true,
        password: hashedPassword,
        emailVerified: 1,
        username: email.substring(0, email.indexOf('@')),
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

  async findByBranch(branchId: string): Promise<Stylists> {
    try {
      const [stylists, total] = await this.userRepository.findAndCount({
        where: {
          branchId,
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

  async getWeeklySchedule(stylistId: string): Promise<WeeklySchedule> {
    try {
      const stylist = await this.findOne(stylistId);
      if (!stylist) {
        throw new NotFoundException(MESSAGE.STYLIST_NOT_FOUND);
      }

      const startDate = new Date();
      if (isNaN(startDate.getTime())) {
        throw new BadRequestException(
          'Định dạng ngày không hợp lệ. Sử dụng định dạng YYYY-MM-DD',
        );
      }

      const days: DailySchedule[] = [];

      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        const dateStr = currentDate.toISOString().split('T')[0];

        const dayNames = [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ];
        const dayOfWeek = dayNames[currentDate.getDay()];

        const schedule = await this.entityManager.findOne(StylistSchedule, {
          where: {
            stylistId,
            dayOfWeek,
          },
        });

        const timeOff = await this.entityManager.findOne(StylistTimeOff, {
          where: {
            stylistId,
            date: dateStr,
          },
        });

        const isWorking = schedule ? schedule.isWorking && !timeOff : false;

        days.push({
          date: dateStr,
          dayOfWeek,
          isWorking,
        });
      }

      return {
        stylistId,
        days,
      };
    } catch (error) {
      throw error;
    }
  }
}
