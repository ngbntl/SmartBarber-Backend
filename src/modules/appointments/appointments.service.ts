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
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType, RoleType } from 'src/common/constants/enum';
import { AppointmentSchedulerService } from './appointment-scheduler.service';
import { MailerService } from '../../helpers/mailer.helper';

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
    private notificationsService: NotificationsService,
    private appointmentSchedulerService: AppointmentSchedulerService,
    private mailerService: MailerService,
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

      // Gửi thông báo cho stylist về lịch hẹn mới
      await this.notificationsService.sendNotification(
        stylistId,
        `Bạn có lịch hẹn mới vào ngày ${dateFormatted} lúc ${startTime}.`,
        NotificationType.APPOINTMENT,
        savedAppointment.id,
      );

      // Lập lịch kiểm tra xác nhận sau 24 giờ
      await this.appointmentSchedulerService.schedulePendingAppointmentCheck(
        savedAppointment,
      );

      return {
        statusCode: HttpStatus.OK,
        message: MESSAGE.CREATE_APPOINTMENT_SUCCESS,
      };
    } catch (error) {
      throw error;
    }
  }

  async confirmAppointment(
    appointmentId: string,
    stylistId: string,
    stylistNote?: string,
  ): Promise<MessageResponse> {
    try {
      const appointment = await this.appointmentRepository.findOne({
        where: { id: appointmentId },
        relations: ['branch', 'user', 'stylist'],
      });

      if (!appointment) {
        throw new NotFoundException(MESSAGE.APPOINTMENT_NOT_FOUND);
      }

      if (appointment.stylistId !== stylistId) {
        throw new BadRequestException(
          'Bạn không phải là stylist được chỉ định cho lịch hẹn này',
        );
      }

      if (appointment.status !== 'pending') {
        throw new BadRequestException(
          `Không thể xác nhận lịch hẹn với trạng thái hiện tại: ${appointment.status}`,
        );
      }

      const appointmentDateTime = new Date(appointment.appointmentDate);
      const [hours, minutes] = appointment.startTime.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes);

      const currentTime = new Date();
      if (appointmentDateTime < currentTime) {
        throw new BadRequestException('Không thể xác nhận lịch hẹn đã qua');
      }

      // Hủy bỏ lịch kiểm tra xác nhận vì lịch hẹn đã được xác nhận
      await this.appointmentSchedulerService.cancelConfirmationCheck(
        appointmentId,
      );

      appointment.status = 'confirmed';
      if (stylistNote) {
        appointment.notes = appointment.notes
          ? `${appointment.notes}\n\nGhi chú của stylist: ${stylistNote}`
          : `Ghi chú của stylist: ${stylistNote}`;
      }

      await this.appointmentRepository.save(appointment);

      // Cập nhật lịch trình hẹn trong AppointmentSchedulerService
      await this.appointmentSchedulerService.scheduleAppointment(appointment);

      return {
        statusCode: HttpStatus.OK,
        message: 'Xác nhận lịch hẹn thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async cancelAppointment(
    appointmentId: string,
    userId?: string,
  ): Promise<MessageResponse> {
    try {
      const appointment = await this.appointmentRepository.findOne({
        where: { id: appointmentId },
        relations: ['user', 'branch'],
      });

      if (!appointment) {
        throw new NotFoundException(MESSAGE.APPOINTMENT_NOT_FOUND);
      }

      if (userId && userId !== appointment.userId) {
        throw new BadRequestException(MESSAGE.UNAUTHORIZED_CANCEL_APPOINTMENT);
      }

      const appointmentDateTime = new Date(appointment.appointmentDate);
      const [hours, minutes] = appointment.startTime.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes);

      const currentTime = new Date();
      const timeUntilAppointment =
        appointmentDateTime.getTime() - currentTime.getTime();
      const hoursUntilAppointment = timeUntilAppointment / (1000 * 60 * 60);

      if (hoursUntilAppointment < 1) {
        throw new BadRequestException(MESSAGE.TOO_LATE_TO_CANCEL);
      }

      // Hủy lịch kiểm tra xác nhận và theo dõi (nếu có)
      if (appointment.status === 'pending') {
        await this.appointmentSchedulerService.cancelConfirmationCheck(
          appointmentId,
        );
      } else if (appointment.status === 'confirmed') {
        await this.appointmentSchedulerService.cancelAppointmentTracking(
          appointmentId,
        );
      }

      appointment.status = 'cancelled';
      await this.appointmentRepository.save(appointment);

      await this.bookedTimeSlotRepository.delete({
        appointmentId: appointmentId,
      });

      return {
        statusCode: HttpStatus.OK,
        message: MESSAGE.APPOINTMENT_CANCEL_SUCCESS,
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
          .where('as.appointmentId IN (:...appointmentIds)', { appointmentIds })
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

  async getAppointmentById(appointmentId: string): Promise<Appointment> {
    try {
      const appointment = await this.appointmentRepository.findOne({
        where: { id: appointmentId },
        relations: ['branch', 'user', 'stylist'],
      });

      if (!appointment) {
        throw new NotFoundException(MESSAGE.APPOINTMENT_NOT_FOUND);
      }

      const appointmentServices = await this.appointmentServiceRepository.find({
        where: { appointmentId },
        relations: ['service'],
      });

      appointment.appointmentServices = appointmentServices;

      return appointment;
    } catch (error) {
      throw error;
    }
  }

  async updateAppointmentStatus(
    appointmentId: string,
    stylistId: string,
    { status, note }: { status: string; note?: string },
  ): Promise<MessageResponse> {
    try {
      const appointment = await this.appointmentRepository.findOne({
        where: { id: appointmentId },
        relations: ['user', 'stylist', 'branch'],
      });

      if (!appointment) {
        throw new NotFoundException(MESSAGE.APPOINTMENT_NOT_FOUND);
      }

      if (appointment.stylistId !== stylistId) {
        throw new BadRequestException(
          'Bạn không phải là stylist được chỉ định cho lịch hẹn này',
        );
      }

      const validTransitions = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['in-progress', 'cancelled', 'no-show'],
        'in-progress': ['completed', 'cancelled'],
        cancelled: [],
        completed: [],
        'no-show': ['confirmed'],
      };

      if (!validTransitions[appointment.status]?.includes(status)) {
        throw new BadRequestException(
          `Không thể chuyển từ trạng thái '${appointment.status}' sang '${status}'`,
        );
      }

      if (status === 'completed') {
        const appointmentDateTime = new Date(appointment.appointmentDate);
        const [hours, minutes] = appointment.startTime.split(':').map(Number);
        appointmentDateTime.setHours(hours, minutes);

        const currentTime = new Date();
        if (appointmentDateTime > currentTime) {
          throw new BadRequestException(
            'Không thể đánh dấu hoàn thành lịch hẹn chưa tới thời gian',
          );
        }
      }

      const oldStatus = appointment.status;
      appointment.status = status;

      if (note) {
        const notePrefix =
          status === 'completed'
            ? 'Ghi chú khi hoàn thành: '
            : status === 'no-show'
            ? 'Ghi chú khi khách không đến: '
            : status === 'cancelled'
            ? 'Lý do hủy: '
            : 'Ghi chú: ';

        appointment.notes = appointment.notes
          ? `${appointment.notes}\n\n${notePrefix}${note}`
          : `${notePrefix}${note}`;
      }

      await this.appointmentRepository.save(appointment);

      // Nếu trạng thái thay đổi từ confirmed sang trạng thái khác hoặc
      // từ trạng thái khác sang confirmed, cần cập nhật lịch trình
      if (oldStatus === 'confirmed' && status !== 'confirmed') {
        // Hủy lịch trình theo dõi nếu chuyển từ confirmed sang trạng thái khác
        await this.appointmentSchedulerService.cancelAppointmentTracking(
          appointmentId,
        );
      } else if (oldStatus !== 'confirmed' && status === 'confirmed') {
        // Lên lịch theo dõi nếu chuyển từ trạng thái khác sang confirmed
        await this.appointmentSchedulerService.scheduleAppointment(appointment);
      } else if (status === 'confirmed') {
        // Cập nhật lại lịch trình nếu trạng thái vẫn là confirmed
        await this.appointmentSchedulerService.scheduleAppointment(appointment);
      }

      if (status === 'cancelled') {
        await this.bookedTimeSlotRepository.delete({
          appointmentId: appointmentId,
        });
      }

      return {
        statusCode: HttpStatus.OK,
        message: `Cập nhật trạng thái thành công`,
      };
    } catch (error) {
      throw error;
    }
  }

  async getTodayAppointments(
    branchId: string,
    stylistId?: string,
  ): Promise<Appointments> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const whereCondition: any = {
        branchId,
        appointmentDate: Between(today, tomorrow),
      };

      if (stylistId) {
        whereCondition.stylistId = stylistId;
      }

      const [appointments, total] =
        await this.appointmentRepository.findAndCount({
          where: whereCondition,
          relations: ['branch', 'user', 'stylist'],
          order: { appointmentDate: 'ASC', startTime: 'ASC' },
        });

      if (appointments.length === 0) {
        return { items: [], total: 0 };
      }

      const appointmentIds = appointments.map((app) => app.id);

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

      const appointmentServicesMap = appServices.reduce((map, service) => {
        if (!map[service.appointmentId]) {
          map[service.appointmentId] = [];
        }
        map[service.appointmentId].push(service);
        return map;
      }, {} as Record<string, AppointmentService[]>);

      for (const appointment of appointments) {
        appointment.appointmentServices =
          appointmentServicesMap[appointment.id] || [];
      }

      const items = plainToInstance(AppointmentResponse, appointments, {
        excludeExtraneousValues: true,
      });

      return { items, total };
    } catch (error) {
      throw error;
    }
  }

  async getUpcomingAppointments(
    userId: string,
    days: number = 7,
  ): Promise<Appointments> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + days);

      const [appointments, total] =
        await this.appointmentRepository.findAndCount({
          where: {
            userId,
            appointmentDate: Between(today, endDate),
            status: 'confirmed',
          },
          relations: ['branch', 'stylist'],
          order: { appointmentDate: 'ASC', startTime: 'ASC' },
        });

      if (appointments.length === 0) {
        return { items: [], total: 0 };
      }

      const appointmentIds = appointments.map((app) => app.id);
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

      for (const appointment of appointments) {
        appointment.appointmentServices = appServices.filter(
          (as) => as.appointmentId === appointment.id,
        );
      }

      const items = plainToInstance(AppointmentResponse, appointments, {
        excludeExtraneousValues: true,
      });
      return { items, total };
    } catch (error) {
      throw error;
    }
  }

  async emergencyCancelAppointment(
    appointmentId: string,
    stylistId: string,
    emergencyReason: string,
  ): Promise<MessageResponse> {
    try {
      const appointment = await this.appointmentRepository.findOne({
        where: { id: appointmentId },
        relations: ['user', 'stylist', 'branch'],
      });

      if (!appointment) {
        throw new NotFoundException(MESSAGE.APPOINTMENT_NOT_FOUND);
      }

      // Verify the stylist is assigned to this appointment
      if (appointment.stylistId !== stylistId) {
        throw new BadRequestException(
          'Bạn không phải là stylist được chỉ định cho lịch hẹn này',
        );
      }

      // Check if appointment can be cancelled (only pending or confirmed)
      if (!['pending', 'confirmed'].includes(appointment.status)) {
        throw new BadRequestException(
          `Không thể hủy lịch hẹn với trạng thái hiện tại: ${appointment.status}`,
        );
      }

      // Hủy lịch kiểm tra xác nhận và theo dõi (nếu có)
      if (appointment.status === 'pending') {
        await this.appointmentSchedulerService.cancelConfirmationCheck(
          appointmentId,
        );
      } else if (appointment.status === 'confirmed') {
        await this.appointmentSchedulerService.cancelAppointmentTracking(
          appointmentId,
        );
      }

      // Update appointment status
      appointment.status = 'cancelled';
      appointment.notes = appointment.notes
        ? `${appointment.notes}\n\nLý do hủy khẩn cấp: ${emergencyReason}`
        : `Lý do hủy khẩn cấp: ${emergencyReason}`;

      await this.appointmentRepository.save(appointment);

      // Free up the booked time slot
      await this.bookedTimeSlotRepository.delete({
        appointmentId: appointmentId,
      });

      const formattedDate = this.formatDate(appointment.appointmentDate);
      const messageContent = `Lịch hẹn của bạn vào ngày ${formattedDate} lúc ${appointment.startTime} đã bị hủy. Lý do: ${emergencyReason}`;

      // Gửi thông báo trong ứng dụng cho người dùng
      await this.notificationsService.sendNotification(
        appointment.userId,
        messageContent,
        NotificationType.APPOINTMENT,
        appointmentId,
      );

      // Tìm thông tin người dùng để lấy email
      if (appointment.user && appointment.user.email) {
        const userName = `${appointment.user.firstName || ''} ${
          appointment.user.lastName || ''
        }`.trim();

        // Tạo nội dung HTML cho email
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Thông báo hủy lịch hẹn</h2>
            <p>Xin chào ${userName},</p>
            <p>Chúng tôi rất tiếc phải thông báo lịch hẹn của bạn đã bị hủy vì lý do khẩn cấp.</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #dc3545; margin: 15px 0;">
              <p><strong>Chi tiết lịch hẹn:</strong></p>
              <p>Ngày: ${formattedDate}</p>
              <p>Giờ: ${appointment.startTime}</p>
              <p>Chi nhánh: ${
                appointment.branch ? appointment.branch.name : ''
              }</p>
              <p>Stylist: ${
                appointment.stylist
                  ? `${appointment.stylist.firstName} ${appointment.stylist.lastName}`
                  : ''
              }</p>
              <p><strong>Lý do hủy:</strong> ${emergencyReason}</p>
            </div>
            <p>Chúng tôi rất xin lỗi vì sự bất tiện này và mong bạn có thể đặt lịch hẹn mới vào thời gian khác.</p>
            <p>Nếu cần trợ giúp đặt lịch hẹn mới, vui lòng liên hệ với chúng tôi qua ứng dụng hoặc gọi điện.</p>
            <p>Trân trọng,<br>Đội ngũ SmartBarber</p>
          </div>
        `;

        // Gửi email cho khách hàng
        await this.mailerService.sendMail(
          appointment.user.email,
          'Thông báo hủy lịch hẹn',
          emailHtml,
        );
      } else {
        console.log(
          `Không thể gửi email thông báo hủy lịch hẹn cho người dùng ID ${appointment.userId}: Email không có sẵn`,
        );
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Lịch hẹn đã được hủy trong tình huống khẩn cấp',
      };
    } catch (error) {
      throw error;
    }
  }

  async reassignAppointment(
    appointmentId: string,
    currentStylistId: string,
    newStylistId: string,
    reason?: string,
  ): Promise<MessageResponse> {
    try {
      const appointment = await this.appointmentRepository.findOne({
        where: { id: appointmentId },
        relations: ['user', 'stylist', 'branch'],
      });

      if (!appointment) {
        throw new NotFoundException(MESSAGE.APPOINTMENT_NOT_FOUND);
      }

      // Verify current stylist is assigned to this appointment or is admin
      const currentUser = await this.userServices.findById(currentStylistId);
      if (
        appointment.stylistId !== currentStylistId &&
        currentUser?.roleType !== RoleType.ADMIN
      ) {
        throw new BadRequestException(
          'Bạn không có quyền chuyển giao lịch hẹn này',
        );
      }

      // Check if appointment can be reassigned (only pending or confirmed)
      if (!['pending', 'confirmed'].includes(appointment.status)) {
        throw new BadRequestException(
          `Không thể chuyển giao lịch hẹn với trạng thái hiện tại: ${appointment.status}`,
        );
      }

      // Check if the appointment date is in the future
      const now = new Date();
      const appointmentDate = new Date(appointment.appointmentDate);
      const [hours, minutes] = appointment.startTime.split(':').map(Number);
      appointmentDate.setHours(hours, minutes);

      if (appointmentDate <= now) {
        throw new BadRequestException('Không thể chuyển giao lịch hẹn đã qua');
      }

      // Get new stylist
      const newStylist = await this.stylistService.findOne(newStylistId);
      if (!newStylist) {
        throw new NotFoundException(MESSAGE.STYLIST_NOT_FOUND);
      }

      // Check if new stylist is available at this time
      const dateFormatted = this.formatDate(appointmentDate);
      const existingStylistBookings = await this.bookedTimeSlotRepository.find({
        where: {
          stylistId: newStylistId,
          bookingDate: appointmentDate,
        },
      });

      const startTime = appointment.startTime;
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const startDateTime = new Date(
        appointmentDate.getFullYear(),
        appointmentDate.getMonth(),
        appointmentDate.getDate(),
        startHour,
        startMinute,
      );

      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(
        startDateTime.getMinutes() + appointment.durationMinutes,
      );

      // Check if the stylist is available
      const isStylistTimeSlotBooked = existingStylistBookings.some(
        (booking) => {
          const [bookingHour, bookingMin] = booking.startTime
            .split(':')
            .map(Number);
          const bookingStart = new Date(
            appointmentDate.getFullYear(),
            appointmentDate.getMonth(),
            appointmentDate.getDate(),
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

      if (isStylistTimeSlotBooked) {
        throw new ConflictException(
          'Stylist mới đã có lịch hẹn khác vào thời gian này',
        );
      }

      // Check if stylist is working on that day
      const dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      const dayOfWeek = dayNames[appointmentDate.getDay()];

      const stylistSchedule =
        await this.timeSlotsService.getStylistScheduleForDate(
          newStylistId,
          dateFormatted,
          dayOfWeek,
        );

      if (!stylistSchedule || !stylistSchedule.isWorking) {
        throw new BadRequestException(
          'Stylist mới không làm việc vào ngày này',
        );
      }

      // Check time off
      const isTimeOff = await this.timeSlotsService.isStylistOffDuringTime(
        newStylistId,
        dateFormatted,
        startTime,
      );

      if (isTimeOff) {
        throw new BadRequestException(
          'Stylist mới đã đăng ký nghỉ vào khung giờ này',
        );
      }

      // Update appointment with new stylist
      const oldStylistName = appointment.stylist
        ? `${appointment.stylist.firstName} ${appointment.stylist.lastName}`
        : 'Không có stylist';
      const newStylistName = `${newStylist.firstName} ${newStylist.lastName}`;

      appointment.stylistId = newStylistId;
      appointment.notes = appointment.notes
        ? `${
            appointment.notes
          }\n\nLịch hẹn đã được chuyển từ ${oldStylistName} sang ${newStylistName}${
            reason ? `. Lý do: ${reason}` : ''
          }`
        : `Lịch hẹn đã được chuyển từ ${oldStylistName} sang ${newStylistName}${
            reason ? `. Lý do: ${reason}` : ''
          }`;

      await this.appointmentRepository.save(appointment);

      // Update booked time slot
      const bookedTimeSlot = await this.bookedTimeSlotRepository.findOne({
        where: { appointmentId },
      });

      if (bookedTimeSlot) {
        bookedTimeSlot.stylistId = newStylistId;
        await this.bookedTimeSlotRepository.save(bookedTimeSlot);
      }

      // Send notifications
      await this.notificationsService.sendNotification(
        appointment.userId,
        `Lịch hẹn của bạn vào ngày ${dateFormatted} lúc ${startTime} đã được chuyển sang stylist ${newStylistName}${
          reason ? `. Lý do: ${reason}` : ''
        }`,
        NotificationType.APPOINTMENT,
        appointmentId,
      );

      await this.notificationsService.sendNotification(
        newStylistId,
        `Bạn đã được chỉ định cho lịch hẹn vào ngày ${dateFormatted} lúc ${startTime}${
          reason ? `. Lý do: ${reason}` : ''
        }`,
        NotificationType.APPOINTMENT,
        appointmentId,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Chuyển giao lịch hẹn thành công',
      };
    } catch (error) {
      throw error;
    }
  }
}
