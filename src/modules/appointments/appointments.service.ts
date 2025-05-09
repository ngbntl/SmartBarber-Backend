import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Appointment } from '../../database/entities/appointment.entity';
import { TimeSlot } from '../../database/entities/time-slot.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ServicesService } from '../services/services.service';
import { MessageResponse } from 'src/common/types/response';
import { MESSAGE } from 'src/common/constants/message';
import { StylistsService } from '../stylists/stylists.service';
import { BranchesService } from '../branches/branches.service';
import { Appointments, AppointmentResponse } from './types/appointments.types';
import { plainToClass, plainToInstance } from 'class-transformer';
@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(TimeSlot)
    private timeSlotRepository: Repository<TimeSlot>,
    private branchService: BranchesService,
    private stylistService: StylistsService,
    private servicesService: ServicesService,
  ) {}

  async createAppointment(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<MessageResponse> {
    try {
      const {
        userId,
        serviceId,
        branchId,
        stylistId,
        appointmentDate,
        startTime,
      } = createAppointmentDto;

      const service = await this.servicesService.getServiceById(serviceId);
      const user = await this.stylistService.findOne(userId);
      if (!user) {
        throw new NotFoundException(MESSAGE.USER_NOT_FOUND);
      }

      const branch = await this.branchService.findOne(branchId);

      if (!branch) {
        throw new NotFoundException(MESSAGE.BRANCH_NOT_FOUND);
      }

      if (stylistId) {
        const stylist = await this.stylistService.findOne(stylistId);

        if (!stylist) {
          throw new NotFoundException(MESSAGE.STYLIST_NOT_FOUND);
        }
        if (stylist.branchId !== branchId) {
          throw new BadRequestException(MESSAGE.STYLIST_NOT_BELONG_TO_BRANCH);
        }
      }

      const bookingDate = new Date(appointmentDate);
      if (bookingDate < new Date()) {
        throw new BadRequestException(MESSAGE.APPOINTMENT_DATE_IN_PAST);
      }

      const [hours, minutes] = startTime.split(':').map(Number);
      const durationMinutes = service.duration; // Thời lượng dịch vụ

      // Tính giờ kết thúc dựa trên giờ bắt đầu và thời lượng
      const endHours = Math.floor(hours + durationMinutes / 60);
      const endMinutes = minutes + (durationMinutes % 60);

      const endTimeString = `${endHours
        .toString()
        .padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

      const year = bookingDate.getFullYear();
      const month = bookingDate.getMonth();
      const day = bookingDate.getDate();
      const startDateTime = new Date(
        year,
        month,
        day,
        parseInt(startTime.split(':')[0]),
        parseInt(startTime.split(':')[1]),
      );
      const endDateTime = new Date(
        year,
        month,
        day,
        parseInt(endTimeString.split(':')[0]),
        parseInt(endTimeString.split(':')[1]),
      );

      const overlappingAppointments = await this.appointmentRepository.find({
        where: {
          branchId,
          stylistId: stylistId ? stylistId : null,
          appointmentDate: Between(
            new Date(year, month, day, 0, 0, 0),
            new Date(year, month, day, 23, 59, 59),
          ),
          status: 'confirmed',
        },
      });

      const isTimeSlotConflict = overlappingAppointments.some((app) => {
        const [startHour, startMin] = app.startTime.split(':').map(Number);
        // Tính thời gian kết thúc dựa vào thời gian bắt đầu và thời lượng
        const endHour = Math.floor(startHour + app.durationMinutes / 60);
        const endMin = startMin + (app.durationMinutes % 60);

        const appStart = new Date(year, month, day, startHour, startMin);
        const appEnd = new Date(year, month, day, endHour, endMin);

        return startDateTime < appEnd && endDateTime > appStart;
      });

      if (isTimeSlotConflict) {
        throw new ConflictException(MESSAGE.TIME_SLOT_CONFLICT);
      }

      const totalAmount = createAppointmentDto.totalAmount || service.price;
      const discountAmount = createAppointmentDto.discountAmount || 0;
      const finalAmount = totalAmount - discountAmount;

      const appointment = this.appointmentRepository.create({
        userId,
        serviceId,
        branchId,
        stylistId: stylistId || null,
        appointmentDate: bookingDate,
        startTime,
        durationMinutes: durationMinutes, // Sử dụng durationMinutes thay vì endTime
        status: 'pending',
        totalAmount,
        discountAmount,
        finalAmount,
        promotionId: createAppointmentDto.promotionId || null,
        notes: createAppointmentDto.notes || '',
        isPaid: false,
        isReviewed: false,
      });

      await this.appointmentRepository.save(appointment);
      return {
        statusCode: HttpStatus.OK,
        message: MESSAGE.CREATE_APPOINTMENT_SUCCESS,
      };
    } catch (error) {
      throw error;
    }
  }

  async getAppointmentsByUser(userId: string): Promise<Appointments> {
    try {
      const [appointments, total] =
        await this.appointmentRepository.findAndCount({
          where: { userId },
          relations: ['service', 'branch', 'stylist'],
          order: { appointmentDate: 'DESC', startTime: 'DESC' },
        });

      const items = plainToInstance(AppointmentResponse, appointments, {
        excludeExtraneousValues: true,
      });
      return { items, total };
    } catch (error) {
      throw error;
    }
  }
}
