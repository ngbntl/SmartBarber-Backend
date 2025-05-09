import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTimestamp } from './base-timestamp';

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
}
