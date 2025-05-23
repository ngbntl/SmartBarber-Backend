import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Appointment } from './appointment.entity';
import { Service } from './service.entity';
import { BaseTimestamp } from './base-timestamp';

@Entity('AppointmentServices')
export class AppointmentService extends BaseTimestamp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Appointment relationship
  @Column('varchar', { name: 'AppointmentId', length: 36 })
  appointmentId: string;

  @ManyToOne(
    () => Appointment,
    (appointment) => appointment.appointmentServices,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'AppointmentId' })
  appointment: Appointment;

  // Service relationship
  @Column('varchar', { name: 'ServiceId', length: 26 })
  serviceId: string;

  @ManyToOne(() => Service, (service) => service.appointmentServices)
  @JoinColumn({ name: 'ServiceId' })
  service: Service;

  // Price at the time of booking (for historical reference)
  @Column({
    name: 'Price',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price: number;

  // Duration at the time of booking (for historical reference)
  @Column({ name: 'Duration' })
  duration: number;

  // Any additional notes for this specific service in this appointment
  @Column({ name: 'Notes', type: 'text', nullable: true })
  notes: string;
}
