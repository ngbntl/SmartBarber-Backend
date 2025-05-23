import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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

  @OneToMany(
    () => BookedTimeSlot,
    (bookedTimeSlot) => bookedTimeSlot.timeSlotTemplate,
  )
  bookedTimeSlots: BookedTimeSlot[];
}
