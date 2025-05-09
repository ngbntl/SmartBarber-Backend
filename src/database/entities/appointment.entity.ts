import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UsersEntity } from './users.entity';
import { Service } from './service.entity';
import { Branch } from './branch.entity';
import { Review } from './review.entity';
import { BaseTimestamp } from './base-timestamp';

@Entity('Appointments')
export class Appointment extends BaseTimestamp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // User relationship
  @Column('varchar', { name: 'UserId', length: 26 })
  userId: string;

  @ManyToOne(() => UsersEntity, (user) => user.userAppointments)
  @JoinColumn({ name: 'UserId' })
  user: UsersEntity;

  // Service relationship
  @Column('varchar', { name: 'ServiceId', length: 26 })
  serviceId: string;

  @ManyToOne(() => Service, (service) => service.appointments)
  @JoinColumn({ name: 'ServiceId' })
  service: Service;

  // Stylist relationship
  @Column('varchar', { name: 'StylistId', length: 26, nullable: true })
  stylistId: string;

  @ManyToOne(() => UsersEntity, (user) => user.stylistAppointments)
  @JoinColumn({ name: 'StylistId' })
  stylist: UsersEntity;

  // Branch relationship
  @Column('varchar', { name: 'BranchId', length: 26 })
  branchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'BranchId' })
  branch: Branch;

  // Appointment time details
  @Column({ name: 'AppointmentDate', type: 'datetime' })
  appointmentDate: Date;

  @Column({ name: 'StartTime', type: 'time' })
  startTime: string;

  @Column({ name: 'DurationMinutes', type: 'int' }) // Thay EndTime bằng DurationMinutes
  durationMinutes: number;

  // Appointment status
  @Column({
    name: 'Status',
    type: 'enum',
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending',
  })
  status: string;

  // Financial details
  @Column({
    name: 'TotalAmount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalAmount: number;

  @Column({
    name: 'DiscountAmount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  discountAmount: number;

  @Column({
    name: 'FinalAmount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  finalAmount: number;

  // Payment details
  @Column({ name: 'IsPaid', default: false })
  isPaid: boolean;

  @Column({ name: 'PaymentMethod', nullable: true })
  paymentMethod: string;

  // Promotion reference
  @Column({ name: 'PromotionId', nullable: true })
  promotionId: string;

  // Additional info
  @Column({ name: 'Notes', type: 'text', nullable: true })
  notes: string;

  // Review status and relationship
  @Column({ name: 'IsReviewed', default: false })
  isReviewed: boolean;

  @OneToMany(() => Review, (review) => review.appointment)
  reviews: Review[];
}
