import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseTimestamp } from './base-timestamp';
import { UsersEntity } from './users.entity';
import { Appointment } from './appointment.entity';
import { TimeSlotTemplate } from './time-slot-template.entity';

@Entity('BookedTimeSlots')
export class BookedTimeSlot extends BaseTimestamp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Ngày được đặt
  @Column({ name: 'BookingDate', type: 'date' })
  bookingDate: Date;

  // Khung giờ
  @Column({ name: 'StartTime', type: 'time' })
  startTime: string;

  // Liên kết đến TimeSlotTemplate
  @Column('varchar', { name: 'TimeSlotTemplateId', length: 36, nullable: true })
  timeSlotTemplateId: string;

  @ManyToOne(() => TimeSlotTemplate)
  @JoinColumn({ name: 'TimeSlotTemplateId' })
  timeSlotTemplate: TimeSlotTemplate;

  // Stylist
  @Column('varchar', { name: 'StylistId', length: 26, nullable: true })
  stylistId: string;

  @ManyToOne(() => UsersEntity)
  @JoinColumn({ name: 'StylistId' })
  stylist: UsersEntity;

  // Liên kết với appointment
  @Column('varchar', { name: 'AppointmentId', length: 36 })
  appointmentId: string;

  @ManyToOne(() => Appointment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'AppointmentId' })
  appointment: Appointment;
}
