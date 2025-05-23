import { Column, Entity, PrimaryColumn, OneToMany } from 'typeorm';
import { BaseTimestamp } from './base-timestamp';
import { AppointmentService } from './appointment-service.entity';

@Entity('services')
export class Service extends BaseTimestamp {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  // Service information
  @Column({ name: 'Name', length: 100 })
  name: string;

  @Column({ name: 'Description', type: 'text' })
  description: string;

  @Column({ name: 'Price', type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'Duration', comment: 'Thời gian thực hiện dịch vụ (phút)' })
  duration: number;

  // Media
  @Column({ name: 'Image', nullable: true })
  image: string;

  // Status
  @Column({ name: 'IsActive', default: true })
  isActive: boolean;

  // Relationships
  @OneToMany(
    () => AppointmentService,
    (appointmentService) => appointmentService.service,
  )
  appointmentServices: AppointmentService[];
}
