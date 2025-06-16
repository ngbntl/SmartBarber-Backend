import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { BookedTimeSlot } from './booked-time-slot.entity';

@Entity('time_slot_templates')
export class TimeSlotTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  description: string;

  @Column({ name: 'created_at', type: 'bigint', nullable: true })
  createdAt: number;

  @Column({ name: 'updated_at', type: 'bigint', nullable: true })
  updatedAt: number;

  @Column({ name: 'deleted_at', type: 'bigint', nullable: true })
  deletedAt: number;

  @OneToMany(
    () => BookedTimeSlot,
    (bookedTimeSlot) => bookedTimeSlot.timeSlotTemplate,
  )
  bookedTimeSlots: BookedTimeSlot[];

  @BeforeInsert()
  setCreatedAt() {
    const now = Date.now();
    this.createdAt = now;
    this.updatedAt = now;
  }

  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = Date.now();
  }
}
