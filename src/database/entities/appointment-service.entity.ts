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

@Entity('appointmentservices')
export class AppointmentService extends BaseTimestamp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column('varchar', { name: 'ServiceId', length: 26 })
  serviceId: string;

  @ManyToOne(() => Service, (service) => service.appointmentServices)
  @JoinColumn({ name: 'ServiceId' })
  service: Service;

  @Column({
    name: 'Price',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price: number;

  @Column({ name: 'Duration' })
  duration: number;

  @Column({ name: 'Notes', type: 'text', nullable: true })
  notes: string;
}
