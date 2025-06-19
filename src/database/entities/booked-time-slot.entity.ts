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

@Entity('bookedtimeslots')
export class BookedTimeSlot extends BaseTimestamp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'BookingDate', type: 'date' })
  bookingDate: Date;

  @Column({ name: 'StartTime', type: 'time' })
  startTime: string;

  @Column('varchar', { name: 'TimeSlotTemplateId', length: 36, nullable: true })
  timeSlotTemplateId: string;

  @ManyToOne(() => TimeSlotTemplate)
  @JoinColumn({ name: 'TimeSlotTemplateId' })
  timeSlotTemplate: TimeSlotTemplate;

  @Column('varchar', { name: 'StylistId', length: 26, nullable: true })
  stylistId: string;

  @ManyToOne(() => UsersEntity)
  @JoinColumn({ name: 'StylistId' })
  stylist: UsersEntity;

  @Column('varchar', { name: 'AppointmentId', length: 36 })
  appointmentId: string;

  @ManyToOne(() => Appointment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'AppointmentId' })
  appointment: Appointment;
}
