import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { TimeSlotTemplate } from '../../database/entities/time-slot-template.entity';
import { MESSAGE } from 'src/common/constants/message';
import { StylistSchedule } from '../../database/entities/stylist-schedule.entity';
import { StylistTimeOff } from '../../database/entities/stylist-time-off.entity';
import { Appointment } from '../../database/entities/appointment.entity';
import { BookedTimeSlot } from '../../database/entities/booked-time-slot.entity';
import { StylistsService } from '../stylists/stylists.service';
import { TimeSlots } from './types/timeslots.type';
import { formatDate, getDayOfWeek } from 'src/utils/function';

@Injectable()
export class TimeSlotsService {
  constructor(
    @InjectRepository(TimeSlotTemplate)
    private timeSlotTemplateRepository: Repository<TimeSlotTemplate>,
    @InjectRepository(StylistSchedule)
    private stylistScheduleRepository: Repository<StylistSchedule>,
    @InjectRepository(StylistTimeOff)
    private stylistTimeOffRepository: Repository<StylistTimeOff>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(BookedTimeSlot)
    private bookedTimeSlotRepository: Repository<BookedTimeSlot>,
    private stylistService: StylistsService,
  ) {}

  async getAvailableTimeSlotsByStylist(
    stylistId: string,
    date?: string,
  ): Promise<TimeSlots> {
    const stylist = await this.stylistService.findOne(stylistId);

    if (!stylist) {
      throw new NotFoundException(MESSAGE.STYLIST_NOT_FOUND);
    }

    let requestDate = new Date();
    if (date) {
      try {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          throw new BadRequestException('Ngày không hợp lệ');
        }
        requestDate = parsedDate;
      } catch (error) {
        throw new BadRequestException('Ngày không hợp lệ');
      }
    }

    const dayOfWeek = getDayOfWeek(requestDate);

    const dateString = formatDate(requestDate);

    const workingDay = await this.stylistScheduleRepository.findOne({
      where: {
        stylistId,
        dayOfWeek,
        isWorking: true,
      },
    });

    if (!workingDay) {
      return {
        items: [],
        total: 0,
      };
    }

    const timeOffDay = await this.stylistTimeOffRepository.findOne({
      where: {
        stylistId,
        date: dateString,
        startTime: null,
        endTime: null,
      },
    });

    if (timeOffDay) {
      return {
        items: [],
        total: 0,
      };
    }

    const timeSlotTemplates = await this.timeSlotTemplateRepository.find({
      where: {
        isActive: true,
      },
      order: {
        startTime: 'ASC',
      },
    });

    const partialTimeOffs = await this.stylistTimeOffRepository.find({
      where: {
        stylistId,
        date: dateString,
        startTime: Not(IsNull()),
        endTime: Not(IsNull()),
      },
    });

    const bookedSlots = await this.bookedTimeSlotRepository.find({
      where: {
        stylistId,
        bookingDate: dateString,
      },
    });
    console.log(bookedSlots);

    const availableTimeSlots = timeSlotTemplates.filter((template) => {
      const isInTimeOff = partialTimeOffs.some((timeOff) => {
        return this.isTimeOverlap(
          template.startTime,
          template.endTime,
          timeOff.startTime,
          timeOff.endTime,
        );
      });

      const isBooked = bookedSlots.some((slot) => {
        const appointmentDuration = slot.appointment?.durationMinutes || 60;

        return this.isTimeOverlap(
          template.startTime,
          template.endTime,
          slot.startTime,
          this.calculateEndTime(slot.startTime, appointmentDuration),
        );
      });

      return !isInTimeOff && !isBooked;
    });

    const formattedItems = availableTimeSlots.map((template) => ({
      id: template.id,
      startTime: template.startTime,
      endTime: template.endTime,
      isAvailable: true,
      description: template.description,
    }));

    return {
      items: formattedItems,
      total: formattedItems.length,
    };
  }

  private isTimeOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string,
  ): boolean {
    return start1 < end2 && start2 < end1;
  }

  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes, seconds] = startTime.split(':').map(Number);

    const tempDate = new Date();
    tempDate.setHours(hours, minutes + durationMinutes, seconds || 0, 0);

    const endHours = tempDate.getHours().toString().padStart(2, '0');
    const endMinutes = tempDate.getMinutes().toString().padStart(2, '0');
    const endSeconds = tempDate.getSeconds().toString().padStart(2, '0');

    return `${endHours}:${endMinutes}:${endSeconds}`;
  }

  async getTimeSlotStatusByDate(
    stylistId: string,
    date: string,
  ): Promise<TimeSlots> {
    const stylist = await this.stylistService.findOne(stylistId);
    if (!stylist) {
      throw new NotFoundException(MESSAGE.STYLIST_NOT_FOUND);
    }

    // Chuyển đổi date thành đối tượng Date
    let requestDate: Date;
    try {
      requestDate = new Date(date);
      if (isNaN(requestDate.getTime())) {
        throw new BadRequestException('Ngày không hợp lệ');
      }
    } catch (error) {
      throw new BadRequestException('Ngày không hợp lệ');
    }

    const dateString = formatDate(requestDate);
    const formattedDate = new Date(dateString);
    const dayOfWeek = getDayOfWeek(requestDate);

    const workingDay = await this.stylistScheduleRepository.findOne({
      where: {
        stylistId,
        dayOfWeek,
        isWorking: true,
      },
    });

    const timeSlotTemplates = await this.timeSlotTemplateRepository.find({
      where: {
        isActive: true,
      },
      order: {
        startTime: 'ASC',
      },
    });

    if (!workingDay) {
      const formattedItems = timeSlotTemplates.map((template) => ({
        id: template.id,
        startTime: template.startTime,
        endTime: template.endTime,
        isAvailable: false,
        description: template.description,
        reason: 'Stylist không làm việc vào ngày này',
      }));

      return {
        items: formattedItems,
        total: formattedItems.length,
      };
    }

    const timeOffDay = await this.stylistTimeOffRepository.findOne({
      where: {
        stylistId,
        date: dateString,
        startTime: null,
        endTime: null,
      },
    });

    if (timeOffDay) {
      const formattedItems = timeSlotTemplates.map((template) => ({
        id: template.id,
        startTime: template.startTime,
        endTime: template.endTime,
        isAvailable: false,
        description: template.description,
        reason: 'Stylist đã đăng ký nghỉ phép vào ngày này',
      }));

      return {
        items: formattedItems,
        total: formattedItems.length,
      };
    }

    const partialTimeOffs = await this.stylistTimeOffRepository.find({
      where: {
        stylistId,
        date: dateString,
        startTime: Not(IsNull()),
        endTime: Not(IsNull()),
      },
    });

    const bookedSlots = await this.bookedTimeSlotRepository.find({
      where: {
        stylistId,
        bookingDate: formattedDate,
      },
      relations: ['appointment'],
    });

    const formattedItems = timeSlotTemplates.map((template) => {
      const timeOff = partialTimeOffs.find((off) =>
        this.isTimeOverlap(
          template.startTime,
          template.endTime,
          off.startTime,
          off.endTime,
        ),
      );

      const bookedSlot = bookedSlots.find((slot) => {
        const appointmentDuration = slot.appointment?.durationMinutes || 60;
        return this.isTimeOverlap(
          template.startTime,
          template.endTime,
          slot.startTime,
          this.calculateEndTime(slot.startTime, appointmentDuration),
        );
      });

      let isAvailable = true;
      let reason = '';

      if (timeOff) {
        isAvailable = false;
        reason = 'Stylist đã đăng ký nghỉ phép vào khung giờ này';
      } else if (bookedSlot) {
        isAvailable = false;
        reason = 'Khung giờ này đã được đặt';
      }

      return {
        id: template.id,
        startTime: template.startTime,
        endTime: template.endTime,
        isAvailable,
        description: template.description,
        reason: isAvailable ? '' : reason,
        appointmentId: bookedSlot?.appointmentId,
      };
    });

    return {
      items: formattedItems,
      total: formattedItems.length,
    };
  }
}
