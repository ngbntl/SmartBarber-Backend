import {
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  Repository,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
  Not,
  IsNull,
} from 'typeorm';
import { UsersEntity } from '../../database/entities/users.entity';
import { CreateStylistDto } from './dto/create-stylist.dto';
import { CreateTimeOffDto } from './dto/create-time-off.dto';
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
  StylistTimeOffResponse,
  StylistTimeOffs,
} from './types/stylists.type';
import { plainToClass, plainToInstance } from 'class-transformer';
import { RoleType } from 'src/common/constants/enum';
import { generateCustomString, generateUserId } from 'src/utils/function';
import { UsersService } from '../users/users.service';
import { PasswordService } from 'src/helpers/bcrypt.helper';
import { MailerService } from 'src/helpers/mailer.helper';
import { StylistSchedule } from '../../database/entities/stylist-schedule.entity';
import { StylistTimeOff } from '../../database/entities/stylist-time-off.entity';
import { TimeSlotTemplate } from 'src/database/entities/time-slot-template.entity';
import { UpdateStylistDto } from './dto/update-stylist.dto';

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
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
        roleType: RoleType.STYLIST,
        isActive: true,
        password: hashedPassword,
        emailVerified: 1,
        username: email.substring(0, email.indexOf('@')),
      });

      await this.userRepository.save(stylist);

      // Tạo lịch mặc định cho stylist mới
      await this.createDefaultSchedule(userId);

      // Tạo khung giờ mặc định
      await this.createDefaultTimeSlots(userId);

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

  async getSchedule(stylistId: string): Promise<any> {
    try {
      const stylist = await this.findOne(stylistId);
      if (!stylist) {
        throw new NotFoundException(MESSAGE.STYLIST_NOT_FOUND);
      }

      const schedules = await this.entityManager.find(StylistSchedule, {
        where: { stylistId },
      });

      // Đảm bảo có đủ 7 ngày trong tuần
      const daysOfWeek = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ];

      const result = daysOfWeek.map((day) => {
        const schedule = schedules.find((s) => s.dayOfWeek === day);
        return {
          dayOfWeek: day,
          isWorking: schedule ? schedule.isWorking : false,
        };
      });

      return {
        stylistId,
        schedules: result,
      };
    } catch (error) {
      throw error;
    }
  }

  async createDefaultSchedule(stylistId: string): Promise<void> {
    // Lịch mặc định: làm việc từ thứ 2 đến thứ 7, nghỉ chủ nhật
    const defaultSchedules = [
      { dayOfWeek: 'Monday', isWorking: true },
      { dayOfWeek: 'Tuesday', isWorking: true },
      { dayOfWeek: 'Wednesday', isWorking: true },
      { dayOfWeek: 'Thursday', isWorking: true },
      { dayOfWeek: 'Friday', isWorking: true },
      { dayOfWeek: 'Saturday', isWorking: true },
      { dayOfWeek: 'Sunday', isWorking: false },
    ];

    const schedules = defaultSchedules.map((schedule) => {
      return this.entityManager.create(StylistSchedule, {
        stylistId,
        dayOfWeek: schedule.dayOfWeek,
        isWorking: schedule.isWorking,
      });
    });

    await this.entityManager.save(StylistSchedule, schedules);
  }

  async createDefaultTimeSlots(stylistId: string): Promise<void> {
    try {
      // Thay vì tạo TimeSlot riêng lẻ cho stylist, ta sẽ đảm bảo
      // các TimeSlotTemplate mặc định đã được tạo sẵn trong hệ thống
      // Kiểm tra xem đã có các TimeSlotTemplate chưa
      const templates = await this.entityManager.find(TimeSlotTemplate);

      if (templates.length === 0) {
        // Tạo các mẫu khung giờ mặc định nếu chưa có
        const defaultTemplates = [];

        // Tạo các template từ 8:00 đến 18:00
        for (let hour = 8; hour < 18; hour++) {
          const startTime = `${hour.toString().padStart(2, '0')}:00:00`;
          const endTime = `${(hour + 1).toString().padStart(2, '0')}:00:00`;
          const description = `${hour}:00 - ${hour + 1}:00`;

          defaultTemplates.push(
            this.entityManager.create(TimeSlotTemplate, {
              startTime,
              endTime,
              isActive: true,
              description,
            }),
          );
        }

        // Lưu các template vào database
        await this.entityManager.save(TimeSlotTemplate, defaultTemplates);
        Logger.log('Created default time slot templates');
      }

      // Không còn lưu TimeSlot cho từng stylist nữa
      // Khi cần kiểm tra thời gian rảnh, sẽ lấy tất cả TimeSlotTemplate
      // và loại bỏ các BookedTimeSlot tương ứng

      Logger.log(`Stylist ${stylistId} will use global time slot templates`);
    } catch (error) {
      Logger.error(
        `Error setting up time slots for stylist ${stylistId}: ${error.message}`,
      );
    }
  }

  async getStylistTimeOffs(
    stylistId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<StylistTimeOffs> {
    try {
      // Verify that the stylist exists
      const stylist = await this.findOne(stylistId);
      if (!stylist) {
        throw new NotFoundException(MESSAGE.STYLIST_NOT_FOUND);
      }

      // If no dates are provided, use current week
      if (!startDate && !endDate) {
        // Get current week's start (Monday) and end (Sunday)
        const today = new Date();
        const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday, etc.

        // Calculate the start date (Monday) of the current week
        const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // If today is Sunday, go back 6 days, otherwise calculate days to Monday
        const monday = new Date(today);
        monday.setDate(today.getDate() + mondayOffset);
        monday.setHours(0, 0, 0, 0);

        // Calculate the end date (Sunday) of the current week
        const sunday = new Date(today);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        // Format dates to YYYY-MM-DD
        startDate = monday.toISOString().split('T')[0];
        endDate = sunday.toISOString().split('T')[0];
      }

      // Create query conditions
      const whereCondition: any = { stylistId };

      // Add date range filter if provided
      if (startDate && endDate) {
        // Validate dates
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);

        if (
          isNaN(parsedStartDate.getTime()) ||
          isNaN(parsedEndDate.getTime())
        ) {
          throw new BadRequestException(
            'Định dạng ngày không hợp lệ. Sử dụng định dạng YYYY-MM-DD',
          );
        }

        whereCondition.date = Between(startDate, endDate);
      } else if (startDate) {
        // If only start date is provided, get time offs from that date onward
        const parsedStartDate = new Date(startDate);
        if (isNaN(parsedStartDate.getTime())) {
          throw new BadRequestException(
            'Định dạng ngày không hợp lệ. Sử dụng định dạng YYYY-MM-DD',
          );
        }
        whereCondition.date = MoreThanOrEqual(startDate);
      } else if (endDate) {
        // If only end date is provided, get time offs up to that date
        const parsedEndDate = new Date(endDate);
        if (isNaN(parsedEndDate.getTime())) {
          throw new BadRequestException(
            'Định dạng ngày không hợp lệ. Sử dụng định dạng YYYY-MM-DD',
          );
        }
        whereCondition.date = LessThanOrEqual(endDate);
      }

      // Query the time offs
      const [timeOffs, total] = await this.entityManager.findAndCount(
        StylistTimeOff,
        {
          where: whereCondition,
          order: { date: 'ASC', startTime: 'ASC' },
        },
      );

      // Transform time offs to add isFullDay field
      const transformedTimeOffs = timeOffs.map((timeOff) => {
        const isFullDay = !timeOff.startTime && !timeOff.endTime;
        return {
          ...timeOff,
          isFullDay,
        };
      });

      // Return as paginated response
      const items = plainToInstance(
        StylistTimeOffResponse,
        transformedTimeOffs,
        {
          excludeExtraneousValues: true,
        },
      );

      return { items, total };
    } catch (error) {
      throw error;
    }
  }

  async createTimeOff(
    createTimeOffDto: CreateTimeOffDto,
  ): Promise<MessageResponse> {
    try {
      const { stylistId, date, startTime, endTime, reason } = createTimeOffDto;

      // Verify that the stylist exists
      const stylist = await this.findOne(stylistId);
      if (!stylist) {
        throw new NotFoundException(MESSAGE.STYLIST_NOT_FOUND);
      }

      // Validate date format
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException(
          'Định dạng ngày không hợp lệ. Sử dụng định dạng YYYY-MM-DD',
        );
      }

      // Check if date is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (parsedDate < today) {
        throw new BadRequestException(
          'Không thể đăng ký ngày nghỉ trong quá khứ',
        );
      }

      // If both startTime and endTime are provided, validate them
      if (startTime && endTime) {
        // Validate time format
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
        if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
          throw new BadRequestException(
            'Định dạng thời gian không hợp lệ. Sử dụng định dạng HH:MM:SS',
          );
        }

        // Check if endTime is after startTime
        if (endTime <= startTime) {
          throw new BadRequestException(
            'Thời gian kết thúc phải sau thời gian bắt đầu',
          );
        }
      }

      // Check for existing time-off entries for this date
      const existingTimeOff = await this.entityManager.findOne(StylistTimeOff, {
        where: {
          stylistId,
          date,
          // If existing entry is for full day, it conflicts with any new entry
          startTime: null,
          endTime: null,
        },
      });

      if (existingTimeOff) {
        throw new BadRequestException(
          'Đã có đăng ký nghỉ cả ngày cho ngày này',
        );
      }

      // If registering for full day, check for any partial time-offs on that day
      if (!startTime && !endTime) {
        const partialTimeOffs = await this.entityManager.find(StylistTimeOff, {
          where: {
            stylistId,
            date,
          },
        });

        if (partialTimeOffs.length > 0) {
          throw new BadRequestException(
            'Đã có các khoảng thời gian nghỉ được đăng ký cho ngày này',
          );
        }
      } else {
        // If registering for partial day, check for overlaps
        const partialTimeOffs = await this.entityManager.find(StylistTimeOff, {
          where: {
            stylistId,
            date,
            startTime: Not(IsNull()),
            endTime: Not(IsNull()),
          },
        });

        // Check for time overlaps with existing time-offs
        for (const timeOff of partialTimeOffs) {
          if (
            (startTime <= timeOff.endTime && endTime >= timeOff.startTime) ||
            (timeOff.startTime <= endTime && timeOff.endTime >= startTime)
          ) {
            throw new BadRequestException(
              'Thời gian nghỉ bị trùng với một khoảng thời gian đã đăng ký',
            );
          }
        }
      }

      // Check for existing appointments on this date and time
      // This would require checking the BookedTimeSlot repository, but I'll leave this for later implementation
      // to keep the scope manageable for now

      // Create the time-off entry
      const timeOff = this.entityManager.create(StylistTimeOff, {
        stylistId,
        date,
        startTime: startTime || null,
        endTime: endTime || null,
        reason: reason || 'Nghỉ cá nhân',
      });

      await this.entityManager.save(StylistTimeOff, timeOff);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Đăng ký ngày nghỉ thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteTimeOff(id: string): Promise<MessageResponse> {
    try {
      // Find the time-off entry
      const timeOff = await this.entityManager.findOne(StylistTimeOff, {
        where: { id },
      });

      if (!timeOff) {
        throw new NotFoundException('Không tìm thấy đăng ký ngày nghỉ');
      }

      // Check if the date is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const timeOffDate = new Date(timeOff.date);

      if (timeOffDate < today) {
        throw new BadRequestException(
          'Không thể xóa đăng ký ngày nghỉ trong quá khứ',
        );
      }

      // Remove the time-off entry
      await this.entityManager.remove(StylistTimeOff, timeOff);

      return {
        statusCode: HttpStatus.OK,
        message: 'Xóa đăng ký ngày nghỉ thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: string,
    updateStylistDto: UpdateStylistDto,
  ): Promise<MessageResponse> {
    try {
      const stylist = await this.userRepository.findOne({
        where: { id, roleType: RoleType.STYLIST },
      });

      if (!stylist) {
        throw new NotFoundException(MESSAGE.STYLIST_NOT_FOUND);
      }

      Object.assign(stylist, updateStylistDto);
      stylist.updatedAt = new Date().getTime();

      await this.userRepository.save(stylist);

      return {
        statusCode: HttpStatus.OK,
        message: ' cập nhật thành công',
      };
    } catch (error) {
      throw error;
    }
  }
}
