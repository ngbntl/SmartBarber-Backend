import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UsersEntity } from './users.entity';

@Entity('stylist_time_off')
export class StylistTimeOff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'StylistId' })
  stylistId: string;

  @Column({ type: 'date', name: 'Date' })
  date: string; // Định dạng: YYYY-MM-DD

  @Column({ type: 'time', nullable: true, name: 'StartTime' })
  startTime: string;

  @Column({ type: 'time', nullable: true, name: 'EndTime' })
  endTime: string;

  @Column({ type: 'text', nullable: true, name: 'Reason' })
  reason: string;

  @ManyToOne(() => UsersEntity)
  @JoinColumn({ name: 'StylistId' })
  stylist: UsersEntity;
}
