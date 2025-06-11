import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../database/entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationType } from 'src/common/constants/enum';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create(
      createNotificationDto,
    );
    return await this.notificationRepository.save(notification);
  }

  // Thêm phương thức mới để gửi thông báo với các tham số đơn giản hơn
  async sendNotification(
    userId: string,
    content: string,
    type: NotificationType,
    referenceId?: string,
    title?: string,
  ): Promise<Notification> {
    const createDto: CreateNotificationDto = {
      userId,
      content,
      type,
      title: title || this.getDefaultTitleForType(type, content),
      referenceId,
    };

    return this.create(createDto);
  }

  // Hàm trợ giúp để tạo tiêu đề mặc định dựa trên loại thông báo
  private getDefaultTitleForType(
    type: NotificationType,
    content: string,
  ): string {
    switch (type) {
      case NotificationType.APPOINTMENT:
        return 'Thông báo lịch hẹn mới';
      case NotificationType.PROMOTION:
        return 'Thông báo khuyến mãi';
      case NotificationType.SYSTEM:
        return 'Thông báo hệ thống';
      default:
        // Sử dụng 50 ký tự đầu tiên của nội dung làm tiêu đề
        return content.length > 50 ? `${content.substring(0, 50)}...` : content;
    }
  }

  async findAll(userId: string, query: QueryNotificationsDto) {
    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC');

    if (query.type) {
      queryBuilder.andWhere('notification.type = :type', { type: query.type });
    }

    if (query.search) {
      queryBuilder.andWhere(
        '(notification.title LIKE :search OR notification.content LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Notification> {
    return await this.notificationRepository.findOne({ where: { id } });
  }

  async update(
    id: string,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    await this.notificationRepository.update(id, updateNotificationDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.notificationRepository.delete(id);
  }

  async markAsRead(id: string): Promise<Notification> {
    await this.notificationRepository.update(id, { isRead: true });
    return await this.findOne(id);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }
}
