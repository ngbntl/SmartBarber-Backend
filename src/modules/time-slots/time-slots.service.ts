import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeSlot } from '../../database/entities/time-slot.entity';
import { UsersEntity } from '../../database/entities/users.entity';
import { MESSAGE } from 'src/common/constants/message';
import { StylistSchedule } from '../../database/entities/stylist-schedule.entity';
import { StylistTimeOff } from '../../database/entities/stylist-time-off.entity';
import { Appointment } from '../../database/entities/appointment.entity';
import { StylistsService } from '../stylists/stylists.service';
import { TimeSlots } from './types/timeslots.type';
import { plainToInstance } from 'class-transformer';
import { TimeSlotResponse } from './types/timeslots.type';

@Injectable()
export class TimeSlotsService {
  constructor(
    @InjectRepository(TimeSlot)
    private timeSlotRepository: Repository<TimeSlot>,
    @InjectRepository(StylistSchedule)
    private stylistScheduleRepository: Repository<StylistSchedule>,
    @InjectRepository(StylistTimeOff)
    private stylistTimeOffRepository: Repository<StylistTimeOff>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
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

    const requestDate = date ? new Date(date) : new Date();
    const dayOfWeek = this.getDayOfWeek(requestDate);
    const dateString = requestDate.toISOString().split('T')[0];

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

    const timeSlots = await this.timeSlotRepository.find({
      where: {
        stylistId,
      },
      order: {
        startTime: 'ASC',
      },
    });

    const timeOffs = await this.stylistTimeOffRepository.find({
      where: {
        stylistId,
        date: dateString,
      },
    });

    const appointments = await this.appointmentRepository.find({
      where: {
        stylistId,
        appointmentDate: new Date(dateString),
      },
    });

    const availableTimeSlots = timeSlots.filter((timeSlot) => {
      const isInTimeOff = timeOffs.some((timeOff) => {
        if (!timeOff.startTime || !timeOff.endTime) {
          return true;
        }

        return this.isTimeOverlap(
          timeSlot.startTime,
          timeSlot.endTime,
          timeOff.startTime,
          timeOff.endTime,
        );
      });

      const isInAppointment = appointments.some((appointment) => {
        const appointmentEndTime = this.calculateEndTime(
          appointment.startTime,
          appointment.durationMinutes,
        );
        return this.isTimeOverlap(
          timeSlot.startTime,
          timeSlot.endTime,
          appointment.startTime,
          appointmentEndTime,
        );
      });

      return !isInTimeOff && !isInAppointment && timeSlot.isAvailable;
    });

    const formattedItems = plainToInstance(
      TimeSlotResponse,
      availableTimeSlots,
      { excludeExtraneousValues: true },
    );

    return {
      items: formattedItems,
      total: formattedItems.length,
    };
  }

  private getDayOfWeek(date: Date): string {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return days[date.getDay()];
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
}
