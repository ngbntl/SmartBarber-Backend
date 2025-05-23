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
import { AppointmentService } from '../../database/entities/appointment-service.entity';
import { TimeSlotTemplate } from '../../database/entities/time-slot-template.entity';
import { BookedTimeSlot } from '../../database/entities/booked-time-slot.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ServicesService } from '../services/services.service';
import { MessageResponse } from 'src/common/types/response';
import { MESSAGE } from 'src/common/constants/message';
import { StylistsService } from '../stylists/stylists.service';
import { BranchesService } from '../branches/branches.service';
import { Appointments, AppointmentResponse } from './types/appointments.types';
import { plainToClass, plainToInstance } from 'class-transformer';
import { UsersService } from '../users/users.service';
import { TimeSlotsService } from '../time-slots/time-slots.service';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(AppointmentService)
    private appointmentServiceRepository: Repository<AppointmentService>,
    @InjectRepository(TimeSlotTemplate)
    private timeSlotTemplateRepository: Repository<TimeSlotTemplate>,
    @InjectRepository(BookedTimeSlot)
    private bookedTimeSlotRepository: Repository<BookedTimeSlot>,
    private userServices: UsersService,
    private branchService: BranchesService,
    private stylistService: StylistsService,
    private servicesService: ServicesService,
    private timeSlotsService: TimeSlotsService,
  ) {}

  async createAppointment(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<MessageResponse> {
    try {
      const {
        userId,
        serviceIds,
        branchId,
        stylistId,
        appointmentDate,
        startTime,
      } = createAppointmentDto;

      if (!serviceIds || serviceIds.length === 0) {
        throw new BadRequestException('Phải chọn ít nhất một dịch vụ');
      }

      const serviceDetails = await Promise.all(
        serviceIds.map(async (serviceId) => {
          const serviceDetail = await this.servicesService.getServiceById(
            serviceId,
          );
          return serviceDetail;
        }),
      );
      const stylist = await this.stylistService.findOne(stylistId);
      if (!stylist) {
        throw new NotFoundException(MESSAGE.STYLIST_NOT_FOUND);
      }

      const user = await this.userServices.findById(userId);

      if (!user) {
        throw new NotFoundException(MESSAGE.USER_NOT_FOUND);
      }

      const branch = await this.branchService.findOne(branchId);
      if (!branch) {
        throw new NotFoundException(MESSAGE.BRANCH_NOT_FOUND);
      }

      if (stylist.branchId !== branchId) {
        throw new BadRequestException(MESSAGE.STYLIST_NOT_BELONG_TO_BRANCH);
      }

      const bookingDate = new Date(appointmentDate);
      if (bookingDate < new Date()) {
        throw new BadRequestException(MESSAGE.APPOINTMENT_DATE_IN_PAST);
      }

      // Tính tổng thời gian của tất cả dịch vụ
      const totalDurationMinutes = serviceDetails.reduce(
        (sum, service) => sum + service.duration,
        0,
      );

      // Tính giờ kết thúc dựa trên giờ bắt đầu và tổng thời lượng
      const [hours, minutes] = startTime.split(':').map(Number);
      const endHours = Math.floor(hours + totalDurationMinutes / 60);
      const endMinutes = minutes + (totalDurationMinutes % 60);

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

      // Kiểm tra xem khung giờ có còn trống không dựa trên BookedTimeSlot
      const dateFormatted = this.formatDate(bookingDate);

      // 1. Kiểm tra trùng lịch của stylist
      const existingStylistBookings = await this.bookedTimeSlotRepository.find({
        where: {
          stylistId,
          bookingDate: bookingDate,
        },
      });

      // 2. Kiểm tra trùng lịch của khách hàng
      const existingUserBookings = await this.appointmentRepository.find({
        where: {
          userId,
          appointmentDate: bookingDate,
          status: 'confirmed', // Chỉ kiểm tra các lịch đã xác nhận
        },
      });

      // 3. Kiểm tra trùng lịch chung của salon (nếu không có stylist cụ thể)
      const existingGeneralBookings = stylistId
        ? []
        : await this.appointmentRepository.find({
            where: {
              branchId,
              appointmentDate: bookingDate,
              stylistId: null, // Chỉ kiểm tra các lịch không có stylist cụ thể
              status: 'confirmed',
            },
          });

      // Kiểm tra xem có thời gian bị trùng với lịch của stylist không
      const isStylistTimeSlotBooked = existingStylistBookings.some(
        (booking) => {
          const [bookingHour, bookingMin] = booking.startTime
            .split(':')
            .map(Number);
          const bookingStart = new Date(
            year,
            month,
            day,
            bookingHour,
            bookingMin,
          );

          // Sử dụng thời gian thực tế của booking thay vì giả định 60 phút
          const bookingDuration = 60; // Mặc định 60 phút nếu không tìm thấy appointment

          // Tìm appointment tương ứng để lấy thời gian chính xác
          const appointment = existingUserBookings.find(
            (app) => app.id === booking.appointmentId,
          );
          const actualDuration = appointment
            ? appointment.durationMinutes
            : bookingDuration;

          const bookingEnd = new Date(bookingStart);
          bookingEnd.setMinutes(bookingStart.getMinutes() + actualDuration);

          return startDateTime < bookingEnd && endDateTime > bookingStart;
        },
      );

      // Kiểm tra xem có thời gian bị trùng với lịch khác của khách hàng không
      const isUserTimeSlotBooked = existingUserBookings.some((appointment) => {
        const [bookingHour, bookingMin] = appointment.startTime
          .split(':')
          .map(Number);
        const bookingStart = new Date(
          year,
          month,
          day,
          bookingHour,
          bookingMin,
        );

        const bookingEnd = new Date(bookingStart);
        bookingEnd.setMinutes(
          bookingStart.getMinutes() + appointment.durationMinutes,
        );

        return startDateTime < bookingEnd && endDateTime > bookingStart;
      });

      // Kiểm tra xem có thời gian bị trùng với lịch chung của salon không
      const isGeneralTimeSlotBooked = existingGeneralBookings.some(
        (appointment) => {
          const [bookingHour, bookingMin] = appointment.startTime
            .split(':')
            .map(Number);
          const bookingStart = new Date(
            year,
            month,
            day,
            bookingHour,
            bookingMin,
          );

          const bookingEnd = new Date(bookingStart);
          bookingEnd.setMinutes(
            bookingStart.getMinutes() + appointment.durationMinutes,
          );

          return startDateTime < bookingEnd && endDateTime > bookingStart;
        },
      );

      // Nếu có bất kỳ trùng lịch nào, báo lỗi
      if (isStylistTimeSlotBooked) {
        throw new ConflictException(
          MESSAGE.TIME_SLOT_CONFLICT +
            ' (Stylist không rảnh vào thời gian này)',
        );
      }

      if (isUserTimeSlotBooked) {
        throw new ConflictException(
          MESSAGE.TIME_SLOT_CONFLICT +
            ' (Bạn đã có lịch hẹn khác vào thời gian này)',
        );
      }

      if (isGeneralTimeSlotBooked) {
        throw new ConflictException(
          MESSAGE.TIME_SLOT_CONFLICT + ' (Salon đã kín lịch vào thời gian này)',
        );
      }

      // Tính tổng tiền từ tất cả các dịch vụ
      const calculatedTotalAmount = serviceDetails.reduce(
        (sum, service) => sum + Number(service.price),
        0,
      );

      const totalAmount =
        createAppointmentDto.totalAmount || calculatedTotalAmount;
      const discountAmount = createAppointmentDto.discountAmount || 0;
      const finalAmount = totalAmount - discountAmount;

      // Tạo đối tượng appointment mới
      const appointment = this.appointmentRepository.create({
        userId,
        branchId,
        stylistId: stylistId || null,
        appointmentDate: bookingDate,
        startTime,
        durationMinutes: totalDurationMinutes,
        status: 'pending',
        totalAmount,
        discountAmount,
        finalAmount,
        promotionId: createAppointmentDto.promotionId || null,
        notes: createAppointmentDto.notes || '',
        isPaid: false,
        isReviewed: false,
      });

      // Lưu appointment trước để có ID
      const savedAppointment = await this.appointmentRepository.save(
        appointment,
      );

      // Tạo các bản ghi appointmentService cho từng service được chọn
      const appointmentServices = serviceDetails.map((service) => {
        return this.appointmentServiceRepository.create({
          appointmentId: savedAppointment.id,
          serviceId: service.id,
          price: service.price,
          duration: service.duration,
          notes: null,
        });
      });

      // Lưu tất cả các bản ghi appointmentService
      await this.appointmentServiceRepository.save(appointmentServices);

      // Tìm TimeSlotTemplate phù hợp dựa trên startTime
      const timeSlotTemplate = await this.timeSlotTemplateRepository.findOne({
        where: { startTime },
      });

      // Tạo bản ghi BookedTimeSlot - không cần cập nhật TimeSlot nữa
      const now = Date.now();
      const bookedTimeSlot = this.bookedTimeSlotRepository.create({
        bookingDate,
        startTime,
        stylistId: stylistId || null,
        appointmentId: savedAppointment.id,
        timeSlotTemplateId: timeSlotTemplate?.id,
        createdAt: now,
        updatedAt: now,
      });

      await this.bookedTimeSlotRepository.save(bookedTimeSlot);

      return {
        statusCode: HttpStatus.OK,
        message: MESSAGE.CREATE_APPOINTMENT_SUCCESS,
      };
    } catch (error) {
      throw error;
    }
  }

  // Helper method for formatting date to YYYY-MM-DD
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async getAppointmentsByUser(userId: string): Promise<Appointments> {
    try {
      // Tìm tất cả appointments của user
      const [appointments, total] =
        await this.appointmentRepository.findAndCount({
          where: { userId },
          relations: ['branch', 'stylist'],
          order: { appointmentDate: 'DESC', startTime: 'DESC' },
        });

      // Lấy ID của tất cả appointments tìm thấy
      const appointmentIds = appointments.map((app) => app.id);

      // Tìm tất cả các services liên quan đến các appointments này
      if (appointmentIds.length > 0) {
        // Sử dụng raw query để tránh vấn đề Column naming
        const appServices = await this.appointmentServiceRepository
          .createQueryBuilder('as')
          .select([
            'as.id',
            'as.appointmentId',
            'as.serviceId',
            'as.price',
            'as.duration',
            'as.notes',
            'service.id',
            'service.name',
            'service.description',
            'service.price',
            'service.duration',
            'service.image',
          ])
          .innerJoinAndSelect('as.service', 'service')
          .where('as.AppointmentId IN (:...appointmentIds)', { appointmentIds })
          .getMany();

        // Gán services vào từng appointment
        for (const appointment of appointments) {
          appointment.appointmentServices = appServices.filter(
            (as) => as.appointmentId === appointment.id,
          );
        }
      }

      const items = plainToInstance(AppointmentResponse, appointments, {
        excludeExtraneousValues: true,
      });
      return { items, total };
    } catch (error) {
      throw error;
    }
  }

  async getAppointmentsByStylist(stylistId: string): Promise<Appointments> {
    try {
      // Tìm tất cả appointments của stylist
      const [appointments, total] =
        await this.appointmentRepository.findAndCount({
          where: { stylistId },
          relations: ['branch', 'user'],
          order: { appointmentDate: 'DESC', startTime: 'DESC' },
        });

      if (appointments.length === 0) {
        return { items: [], total: 0 };
      }

      // Lấy ID của tất cả appointments tìm thấy
      const appointmentIds = appointments.map((app) => app.id);

      // Tìm tất cả các services liên quan đến các appointments này
      const appServices = await this.appointmentServiceRepository
        .createQueryBuilder('as')
        .select([
          'as.id',
          'as.appointmentId',
          'as.serviceId',
          'as.price',
          'as.duration',
          'as.notes',
          'service.id',
          'service.name',
          'service.description',
          'service.price',
          'service.duration',
          'service.image',
        ])
        .innerJoinAndSelect('as.service', 'service')
        .where('as.appointmentId IN (:...appointmentIds)', { appointmentIds })
        .getMany();

      // Tạo map để nhanh chóng lấy services cho mỗi appointment
      const appointmentServicesMap = appServices.reduce((map, service) => {
        if (!map[service.appointmentId]) {
          map[service.appointmentId] = [];
        }
        map[service.appointmentId].push(service);
        return map;
      }, {} as Record<string, AppointmentService[]>);

      // Gán services vào từng appointment
      for (const appointment of appointments) {
        appointment.appointmentServices =
          appointmentServicesMap[appointment.id] || [];
      }

      // Transform thành response DTO
      const items = plainToInstance(AppointmentResponse, appointments, {
        excludeExtraneousValues: true,
      });

      return { items, total };
    } catch (error) {
      throw error;
    }
  }
}
