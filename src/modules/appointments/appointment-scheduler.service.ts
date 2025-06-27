import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Appointment } from '../../database/entities/appointment.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from 'src/common/constants/enum';

@Injectable()
export class AppointmentSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(AppointmentSchedulerService.name);
  private subscriber: any;

  constructor(
    private readonly redisService: RedisService,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private notificationsService: NotificationsService,
    private entityManager: EntityManager,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing appointment scheduler...');

    // Đăng ký lắng nghe sự kiện từ Redis
    this.subscriber = await this.redisService.subscribeToExpired(
      this.handleExpiredKey.bind(this),
    );

    this.logger.log('Appointment scheduler initialized successfully');
  }

  private async handleExpiredKey(channel: string, expiredKey: string) {
    this.logger.log(`Received expired key: ${expiredKey}`);

    if (
      expiredKey.includes('appointment:') &&
      expiredKey.includes(':reminder')
    ) {
      // Xử lý nhắc nhở cho stylist sau 1 giờ
      const appointmentId = expiredKey.split(':')[1];
      await this.sendReminderToStylist(appointmentId);
    } else if (
      expiredKey.includes('appointment:') &&
      expiredKey.includes(':autoUpdate')
    ) {
      // Xử lý tự động cập nhật trạng thái sau 2 giờ
      const appointmentId = expiredKey.split(':')[1];
      await this.autoUpdateAppointmentStatus(appointmentId);
    } else if (
      expiredKey.includes('appointment:') &&
      expiredKey.includes(':confirmationCheck')
    ) {
      // Xử lý hủy lịch hẹn nếu stylist không xác nhận sau thời gian quy định
      const appointmentId = expiredKey.split(':')[1];
      await this.autoProcessUnconfirmedAppointment(appointmentId);
    } else if (
      expiredKey.includes('appointment:') &&
      expiredKey.includes(':preReminder')
    ) {
      // Xử lý thông báo nhắc nhở trước lịch hẹn
      const appointmentId = expiredKey.split(':')[1];
      await this.sendPreAppointmentReminderToStylist(appointmentId);
    }
  }

  /**
   * Lên lịch theo dõi cho một lịch hẹn
   */
  async scheduleAppointment(appointment: Appointment) {
    try {
      // Hủy các lịch trình cũ (nếu có) để tránh trùng lặp
      await this.cancelAppointmentTracking(appointment.id);

      // Chỉ lập lịch cho các lịch hẹn có trạng thái 'confirmed'
      if (appointment.status !== 'confirmed') {
        this.logger.log(
          `Appointment ${appointment.id} is not confirmed, skipping scheduling`,
        );
        return;
      }

      // Lên lịch theo dõi lịch hẹn
      await this.scheduleAppointmentTracking(
        appointment.id,
        appointment.stylistId,
        appointment.appointmentDate,
        appointment.startTime,
      );

      this.logger.log(`Scheduled tracking for appointment ${appointment.id}`);
    } catch (error) {
      this.logger.error(
        `Error scheduling appointment ${appointment.id}:`,
        error,
      );
    }
  }

  /**
   * Lập lịch theo dõi cho một lịch hẹn mới hoặc được cập nhật
   */
  async scheduleAppointmentTracking(
    appointmentId: string,
    stylistId: string,
    appointmentDate: Date,
    startTime: string,
  ) {
    try {
      // Tạo thời gian đầy đủ từ ngày và giờ
      const [hours, minutes] = startTime.split(':').map(Number);
      const scheduledTime = new Date(appointmentDate);
      scheduledTime.setHours(hours, minutes, 0, 0);

      // Chỉ lập lịch cho các lịch hẹn trong tương lai
      if (scheduledTime <= new Date()) {
        this.logger.log(
          `Appointment ${appointmentId} is in the past, not scheduling tracking`,
        );
        return;
      }

      // Lập lịch nhắc nhở sau 1 giờ
      const reminderTtl = await this.redisService.scheduleAppointmentReminder(
        appointmentId,
        stylistId,
        scheduledTime,
      );

      // Lập lịch tự động cập nhật sau 2 giờ
      const updateTtl = await this.redisService.scheduleAppointmentAutoUpdate(
        appointmentId,
        scheduledTime,
      );

      this.logger.log(
        `Scheduled tracking for appointment ${appointmentId}: reminder in ${reminderTtl}s, auto-update in ${updateTtl}s`,
      );
    } catch (error) {
      this.logger.error(
        `Error scheduling tracking for appointment ${appointmentId}:`,
        error,
      );
    }
  }

  /**
   * Hủy lịch theo dõi cho một lịch hẹn
   */
  async cancelAppointmentTracking(appointmentId: string) {
    try {
      await this.redisService.cancelAppointmentSchedules(appointmentId);
      this.logger.log(`Cancelled tracking for appointment ${appointmentId}`);
    } catch (error) {
      this.logger.error(
        `Error cancelling tracking for appointment ${appointmentId}:`,
        error,
      );
    }
  }

  /**
   * Gửi thông báo nhắc nhở cho stylist sau 1 giờ nếu khách chưa đến
   */
  private async sendReminderToStylist(appointmentId: string) {
    try {
      const appointment = await this.appointmentRepository.findOne({
        where: { id: appointmentId },
        relations: ['user', 'branch'],
      });

      if (!appointment) {
        this.logger.warn(
          `Appointment ${appointmentId} not found when sending reminder`,
        );
        return;
      }

      // Chỉ gửi thông báo nếu lịch hẹn vẫn ở trạng thái confirmed
      if (appointment.status !== 'confirmed') {
        this.logger.log(
          `Appointment ${appointmentId} is not in confirmed status (current: ${appointment.status}), skipping reminder`,
        );
        return;
      }

      const userName = appointment.user
        ? `${appointment.user.firstName} ${appointment.user.lastName}`
        : 'Khách hàng';
      const formattedTime = appointment.startTime;
      const formattedDate = new Date(
        appointment.appointmentDate,
      ).toLocaleDateString('vi-VN');

      // Gửi thông báo cho stylist
      await this.notificationsService.sendNotification(
        appointment.stylistId,
        `Lịch hẹn với ${userName} lúc ${formattedTime} ngày ${formattedDate} đã quá 1 giờ mà khách chưa đến. Vui lòng kiểm tra và cập nhật trạng thái.`,
        NotificationType.APPOINTMENT,
        appointmentId,
      );

      this.logger.log(
        `Sent reminder for appointment ${appointmentId} to stylist ${appointment.stylistId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending reminder for appointment ${appointmentId}:`,
        error,
      );
    }
  }

  /**
   * Tự động cập nhật trạng thái lịch hẹn thành no-show sau 2 giờ
   */
  private async autoUpdateAppointmentStatus(appointmentId: string) {
    try {
      const appointment = await this.appointmentRepository.findOne({
        where: { id: appointmentId },
        relations: ['user', 'branch', 'stylist'],
      });

      if (!appointment) {
        this.logger.warn(
          `Appointment ${appointmentId} not found when auto-updating status`,
        );
        return;
      }

      // Chỉ cập nhật nếu lịch hẹn vẫn ở trạng thái confirmed
      if (appointment.status !== 'confirmed') {
        this.logger.log(
          `Appointment ${appointmentId} is not in confirmed status (current: ${appointment.status}), skipping auto-update`,
        );
        return;
      }

      // Cập nhật trạng thái thành no-show
      appointment.status = 'no-show';

      // Thêm ghi chú về việc tự động cập nhật
      const autoUpdateNote =
        'Tự động cập nhật thành không đến sau 2 giờ chờ đợi';
      appointment.notes = appointment.notes
        ? `${appointment.notes}\n\n${autoUpdateNote}`
        : autoUpdateNote;

      await this.appointmentRepository.save(appointment);

      // Thông báo cho stylist
      if (appointment.stylistId) {
        const userName = appointment.user
          ? `${appointment.user.firstName} ${appointment.user.lastName}`
          : 'Khách hàng';
        const formattedTime = appointment.startTime;
        const formattedDate = new Date(
          appointment.appointmentDate,
        ).toLocaleDateString('vi-VN');

        await this.notificationsService.sendNotification(
          appointment.stylistId,
          `Lịch hẹn với ${userName} lúc ${formattedTime} ngày ${formattedDate} đã được tự động cập nhật thành "Khách không đến" sau 2 giờ chờ đợi.`,
          NotificationType.APPOINTMENT,
          appointmentId,
        );
      }

      this.logger.log(
        `Auto-updated status of appointment ${appointmentId} to "no-show"`,
      );
    } catch (error) {
      this.logger.error(
        `Error auto-updating status for appointment ${appointmentId}:`,
        error,
      );
    }
  }

  /**
   * Lập lịch kiểm tra xác nhận cho lịch hẹn mới (trạng thái pending)
   */
  async schedulePendingAppointmentCheck(
    appointment: Appointment,
    checkAfterHours: number = 24,
  ) {
    try {
      // Chỉ lập lịch cho các lịch hẹn có trạng thái 'pending'
      if (appointment.status !== 'pending') {
        this.logger.log(
          `Appointment ${appointment.id} is not pending, skipping confirmation check`,
        );
        return;
      }

      // Hủy lịch kiểm tra cũ (nếu có)
      await this.cancelConfirmationCheck(appointment.id);

      // Lập lịch kiểm tra xác nhận
      const ttl = await this.redisService.scheduleAppointmentConfirmationCheck(
        appointment.id,
        new Date(),
        checkAfterHours,
      );

      // Lập lịch nhắc nhở trước lịch hẹn (nếu lịch hẹn diễn ra trong thời gian ngắn)
      const appointmentDateTime = new Date(appointment.appointmentDate);
      const [hours, minutes] = appointment.startTime.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      const now = new Date();
      const timeUntilAppointment =
        appointmentDateTime.getTime() - now.getTime();
      const hoursUntilAppointment = timeUntilAppointment / (1000 * 60 * 60);

      // Nếu lịch hẹn sẽ diễn ra trong vòng 8 giờ và chưa được xác nhận
      // gửi thông báo nhắc nhở trước lịch hẹn ngay lập tức
      if (hoursUntilAppointment <= 8) {
        await this.sendConfirmationReminderToStylist(appointment);
      }
      // Nếu lịch hẹn diễn ra trong hơn 4 giờ, đặt lịch nhắc nhở trước 4 giờ
      else if (hoursUntilAppointment > 4) {
        const preReminderTtl =
          await this.redisService.schedulePreAppointmentReminder(
            appointment.id,
            appointment.stylistId,
            appointmentDateTime,
            4, // 4 giờ trước lịch hẹn
          );

        if (preReminderTtl > 0) {
          this.logger.log(
            `Scheduled pre-appointment reminder for appointment ${appointment.id} in ${preReminderTtl}s (4h before appointment)`,
          );
        }
      }

      this.logger.log(
        `Scheduled confirmation check for appointment ${appointment.id} in ${ttl}s (${checkAfterHours}h)`,
      );
    } catch (error) {
      this.logger.error(
        `Error scheduling confirmation check for appointment ${appointment.id}:`,
        error,
      );
    }
  }

  /**
   * Hủy lịch kiểm tra xác nhận của một lịch hẹn
   */
  async cancelConfirmationCheck(appointmentId: string) {
    try {
      const confirmationCheckKey = `appointment:${appointmentId}:confirmationCheck`;
      await this.redisService.del(confirmationCheckKey);
      this.logger.log(
        `Cancelled confirmation check for appointment ${appointmentId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error cancelling confirmation check for appointment ${appointmentId}:`,
        error,
      );
    }
  }

  /**
   * Tự động xử lý lịch hẹn chưa được xác nhận sau thời gian quy định
   */
  private async autoProcessUnconfirmedAppointment(appointmentId: string) {
    try {
      const appointment = await this.appointmentRepository.findOne({
        where: { id: appointmentId },
        relations: ['user', 'stylist', 'branch'],
      });

      if (!appointment) {
        this.logger.warn(
          `Appointment ${appointmentId} not found when checking confirmation status`,
        );
        return;
      }

      // Chỉ xử lý nếu lịch hẹn vẫn còn ở trạng thái pending
      if (appointment.status !== 'pending') {
        this.logger.log(
          `Appointment ${appointmentId} is not in pending status (current: ${appointment.status}), skipping auto-cancellation`,
        );
        return;
      }

      // Kiểm tra thời gian lịch hẹn xem có còn hiệu lực
      const appointmentDateTime = new Date(appointment.appointmentDate);
      const [hours, minutes] = appointment.startTime.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes);

      const now = new Date();
      // Nếu lịch hẹn đã qua, tự động hủy
      if (appointmentDateTime <= now) {
        this.logger.log(
          `Appointment ${appointmentId} is in the past, auto-cancelling`,
        );
        await this.autoCancelUnconfirmedAppointment(
          appointment,
          'Stylist không xác nhận lịch hẹn đúng hạn',
        );
        return;
      }

      // Nếu lịch hẹn sắp tới trong vòng 4 giờ mà chưa xác nhận, tự động hủy
      const timeUntilAppointment =
        appointmentDateTime.getTime() - now.getTime();
      const hoursUntilAppointment = timeUntilAppointment / (1000 * 60 * 60);

      if (hoursUntilAppointment <= 4) {
        this.logger.log(
          `Appointment ${appointmentId} is within 4 hours and still pending, auto-cancelling`,
        );
        await this.autoCancelUnconfirmedAppointment(
          appointment,
          'Stylist không xác nhận lịch hẹn đúng hạn',
        );
        return;
      }

      // Nếu lịch hẹn còn xa, gửi thêm nhắc nhở cho stylist và đặt lại lịch kiểm tra sau 8 giờ
      await this.sendConfirmationReminderToStylist(appointment);
      await this.redisService.scheduleAppointmentConfirmationCheck(
        appointmentId,
        now,
        8,
      );
      this.logger.log(
        `Sent reminder for appointment ${appointmentId} and scheduled another check in 8 hours`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing unconfirmed appointment ${appointmentId}:`,
        error,
      );
    }
  }

  /**
   * Tự động hủy lịch hẹn chưa được xác nhận
   */
  private async autoCancelUnconfirmedAppointment(
    appointment: Appointment,
    reason: string,
  ) {
    try {
      // Cập nhật trạng thái lịch hẹn thành "cancelled"
      appointment.status = 'cancelled';

      // Thêm ghi chú về việc tự động hủy
      const autoUpdateNote = `Tự động hủy: ${reason}`;
      appointment.notes = appointment.notes
        ? `${appointment.notes}\n\n${autoUpdateNote}`
        : autoUpdateNote;

      await this.appointmentRepository.save(appointment);

      // Xóa khỏi danh sách khung giờ đã đặt
      await this.entityManager.delete('booked_time_slot', {
        appointmentId: appointment.id,
      });

      // Thông báo cho khách hàng
      if (appointment.userId) {
        const formattedTime = appointment.startTime;
        const formattedDate = new Date(
          appointment.appointmentDate,
        ).toLocaleDateString('vi-VN');

        await this.notificationsService.sendNotification(
          appointment.userId,
          `Lịch hẹn của bạn vào lúc ${formattedTime} ngày ${formattedDate} đã bị hủy tự động do stylist không xác nhận lịch hẹn trong thời gian quy định. Vui lòng đặt lịch lại hoặc liên hệ trực tiếp với salon.`,
          NotificationType.APPOINTMENT,
          appointment.id,
        );
      }

      // Thông báo cho stylist (nếu có)
      if (appointment.stylistId) {
        const userName = appointment.user
          ? `${appointment.user.firstName} ${appointment.user.lastName}`
          : 'Khách hàng';
        const formattedTime = appointment.startTime;
        const formattedDate = new Date(
          appointment.appointmentDate,
        ).toLocaleDateString('vi-VN');

        await this.notificationsService.sendNotification(
          appointment.stylistId,
          `Lịch hẹn với ${userName} lúc ${formattedTime} ngày ${formattedDate} đã bị hủy tự động do bạn không xác nhận lịch hẹn trong thời gian quy định.`,
          NotificationType.APPOINTMENT,
          appointment.id,
        );
      }

      this.logger.log(
        `Auto-cancelled unconfirmed appointment ${appointment.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Error auto-cancelling unconfirmed appointment ${appointment.id}:`,
        error,
      );
    }
  }

  /**
   * Gửi thông báo nhắc nhở cho stylist xác nhận lịch hẹn
   */
  private async sendConfirmationReminderToStylist(appointment: Appointment) {
    try {
      if (!appointment.stylistId) {
        this.logger.warn(
          `Appointment ${appointment.id} has no assigned stylist, cannot send reminder`,
        );
        return;
      }

      const userName = appointment.user
        ? `${appointment.user.firstName} ${appointment.user.lastName}`
        : 'Khách hàng';
      const formattedTime = appointment.startTime;
      const formattedDate = new Date(
        appointment.appointmentDate,
      ).toLocaleDateString('vi-VN');

      // Gửi thông báo cho stylist
      await this.notificationsService.sendNotification(
        appointment.stylistId,
        `Nhắc nhở: Bạn có lịch hẹn với ${userName} lúc ${formattedTime} ngày ${formattedDate} đang chờ xác nhận. Vui lòng xác nhận hoặc hủy lịch hẹn sớm.`,
        NotificationType.APPOINTMENT,
        appointment.id,
      );

      this.logger.log(
        `Sent confirmation reminder for appointment ${appointment.id} to stylist ${appointment.stylistId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending confirmation reminder for appointment ${appointment.id}:`,
        error,
      );
    }
  }

  /**
   * Gửi thông báo nhắc nhở trước lịch hẹn
   */
  private async sendPreAppointmentReminderToStylist(appointmentId: string) {
    try {
      const appointment = await this.appointmentRepository.findOne({
        where: { id: appointmentId },
        relations: ['user', 'branch'],
      });

      if (!appointment) {
        this.logger.warn(
          `Appointment ${appointmentId} not found when sending pre-appointment reminder`,
        );
        return;
      }

      // Chỉ gửi thông báo nếu lịch hẹn vẫn ở trạng thái confirmed
      if (appointment.status !== 'confirmed') {
        this.logger.log(
          `Appointment ${appointmentId} is not in confirmed status (current: ${appointment.status}), skipping pre-appointment reminder`,
        );
        return;
      }

      const userName = appointment.user
        ? `${appointment.user.firstName} ${appointment.user.lastName}`
        : 'Khách hàng';
      const formattedTime = appointment.startTime;
      const formattedDate = new Date(
        appointment.appointmentDate,
      ).toLocaleDateString('vi-VN');

      // Gửi thông báo cho stylist
      await this.notificationsService.sendNotification(
        appointment.stylistId,
        `Nhắc nhở: Bạn có lịch hẹn với ${userName} lúc ${formattedTime} ngày ${formattedDate} sắp diễn ra. Vui lòng kiểm tra và xác nhận lịch hẹn.`,
        NotificationType.APPOINTMENT,
        appointmentId,
      );

      this.logger.log(
        `Sent pre-appointment reminder for appointment ${appointmentId} to stylist ${appointment.stylistId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending pre-appointment reminder for appointment ${appointmentId}:`,
        error,
      );
    }
  }
}
