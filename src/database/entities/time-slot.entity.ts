import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseTimestamp } from './base-timestamp';
import { UsersEntity } from './users.entity';

@Entity('time_slots')
export class TimeSlot extends BaseTimestamp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Time information
  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  // Status
  @Column({ default: true })
  isAvailable: boolean;

  // Stylist relation
  @Column({ nullable: true })
  stylistId: string;

  @ManyToOne(() => UsersEntity, (user) => user.timeSlots)
  @JoinColumn({ name: 'stylistId' })
  stylist: UsersEntity;
}
