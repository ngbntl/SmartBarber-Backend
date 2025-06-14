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

  @Column()
  userId: string;

  @ManyToOne(() => UsersEntity)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.APPOINTMENT,
  })
  type: string; // 'appointment', 'promotion', 'system', etc.

  @Column({ nullable: true })
  referenceId: string;
}
