import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async setOtp(email: string, otp: string, ttl: number = 300) {
    const key = `otp:${email}`;
    const data = JSON.stringify({
      otp,
      expiresAt: Date.now() + ttl * 1000,
      attempts: 0,
    });
    await this.redis.setex(key, ttl, data);
  }

  async getOtp(
    email: string,
  ): Promise<{ otp: string; expiresAt: number; attempts: number } | null> {
    const data = await this.redis.get(`otp:${email}`);
    return data ? JSON.parse(data) : null;
  }

  async incrementAttempts(email: string): Promise<number> {
    const key = `otp:${email}`;
    const data = await this.getOtp(email);
    if (!data) return 0;

    data.attempts += 1;
    await this.redis.setex(key, 300, JSON.stringify(data));
    return data.attempts;
  }

  async deleteOtp(email: string) {
    await this.redis.del(`otp:${email}`);
  }

  // Phương thức để lập lịch thông báo cho stylist sau 1 giờ
  async scheduleAppointmentReminder(
    appointmentId: string,
    stylistId: string,
    scheduledTime: Date,
  ) {
    // Thời gian nhắc nhở = thời gian lịch hẹn + 1 giờ
    const reminderTime = new Date(scheduledTime);
    reminderTime.setHours(reminderTime.getHours() + 1);

    const now = new Date();
    let ttl = Math.floor((reminderTime.getTime() - now.getTime()) / 1000);

    ttl = ttl > 0 ? ttl : 1;

    const key = `appointment:${appointmentId}:reminder`;
    await this.redis.setex(
      key,
      ttl,
      JSON.stringify({ appointmentId, stylistId }),
    );

    return ttl;
  }

  async scheduleAppointmentAutoUpdate(
    appointmentId: string,
    scheduledTime: Date,
  ) {
    // Thời gian tự động cập nhật = thời gian lịch hẹn + 2 giờ
    const updateTime = new Date(scheduledTime);
    updateTime.setHours(updateTime.getHours() + 2);

    const now = new Date();
    let ttl = Math.floor((updateTime.getTime() - now.getTime()) / 1000);

    // Đảm bảo TTL tối thiểu là 1 giây
    ttl = ttl > 0 ? ttl : 1;

    // Lưu thông tin vào Redis với thời gian hết hạn
    const key = `appointment:${appointmentId}:autoUpdate`;
    await this.redis.setex(key, ttl, JSON.stringify({ appointmentId }));

    return ttl;
  }

  // Phương thức lập lịch kiểm tra xác nhận từ stylist (thường là 24 giờ sau khi đặt lịch)
  async scheduleAppointmentConfirmationCheck(
    appointmentId: string,
    createdTime: Date,
    checkAfterHours: number = 24,
  ) {
    // Thời gian kiểm tra = thời gian tạo lịch hẹn + 24 giờ (hoặc số giờ được chỉ định)
    const checkTime = new Date(createdTime);
    checkTime.setHours(checkTime.getHours() + checkAfterHours);

    const now = new Date();
    let ttl = Math.floor((checkTime.getTime() - now.getTime()) / 1000);

    // Đảm bảo TTL tối thiểu là 1 giây
    ttl = ttl > 0 ? ttl : 1;

    // Lưu thông tin vào Redis với thời gian hết hạn
    const key = `appointment:${appointmentId}:confirmationCheck`;
    await this.redis.setex(key, ttl, JSON.stringify({ appointmentId }));

    return ttl;
  }

  // Phương thức lập lịch thông báo nhắc nhở trước lịch hẹn
  async schedulePreAppointmentReminder(
    appointmentId: string,
    stylistId: string,
    scheduledTime: Date,
    hoursBeforeAppointment: number = 4,
  ) {
    // Thời gian nhắc nhở = thời gian lịch hẹn - số giờ trước lịch hẹn
    const reminderTime = new Date(scheduledTime);
    reminderTime.setHours(reminderTime.getHours() - hoursBeforeAppointment);

    const now = new Date();
    // Nếu thời gian nhắc nhở đã qua, không cần thiết lập
    if (reminderTime <= now) {
      return 0;
    }

    let ttl = Math.floor((reminderTime.getTime() - now.getTime()) / 1000);

    // Đảm bảo TTL tối thiểu là 1 giây
    ttl = ttl > 0 ? ttl : 1;

    // Lưu thông tin vào Redis với thời gian hết hạn
    const key = `appointment:${appointmentId}:preReminder`;
    await this.redis.setex(
      key,
      ttl,
      JSON.stringify({ appointmentId, stylistId }),
    );

    return ttl;
  }

  // Phương thức để hủy lịch nhắc nhở và cập nhật tự động
  async cancelAppointmentSchedules(appointmentId: string) {
    const reminderKey = `appointment:${appointmentId}:reminder`;
    const autoUpdateKey = `appointment:${appointmentId}:autoUpdate`;

    await this.redis.del(reminderKey, autoUpdateKey);
  }

  // Phương thức để xóa một key trong Redis
  async del(key: string): Promise<number> {
    return await this.redis.del(key);
  }

  // Phương thức kiểm tra một key có tồn tại không
  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }

  // Đăng ký lắng nghe sự kiện hết hạn (expired) từ Redis
  // Phương thức này sẽ được gọi từ một service khác
  async subscribeToExpired(
    callback: (channel: string, message: string) => void,
  ) {
    // Tạo một kết nối Redis riêng biệt để lắng nghe sự kiện
    const subscriber = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    });

    // Cấu hình Redis để thông báo khi một key hết hạn
    await subscriber.config('SET', 'notify-keyspace-events', 'Ex');

    // Đăng ký kênh thông báo hết hạn
    const keyspaceChannel = '__keyevent@0__:expired';
    await subscriber.subscribe(keyspaceChannel);

    // Xử lý sự kiện khi nhận được thông báo
    subscriber.on('message', callback);

    return subscriber;
  }
}
