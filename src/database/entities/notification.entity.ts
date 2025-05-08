import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsersEntity } from './users.entity';
import { BaseTimestamp } from './base-timestamp';
import { NotificationType } from '../../common/constants/enum';

@Entity('notifications')
export class Notification extends BaseTimestamp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // User relationship
  @Column()
  userId: string;

  @ManyToOne(() => UsersEntity)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;

  // Notification content
  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  // Notification status
  @Column({ default: false })
  isRead: boolean;

  // Notification classification
  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.APPOINTMENT,
  })
  type: string; // 'appointment', 'promotion', 'system', etc.

  // Reference information
  @Column({ nullable: true })
  referenceId: string; // ID of the referenced entity (appointment, promotion, etc.)
}
