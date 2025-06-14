import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UsersEntity } from './users.entity';
import { Branch } from './branch.entity';
import { Review } from './review.entity';
import { BaseTimestamp } from './base-timestamp';
import { AppointmentService } from './appointment-service.entity';

@Entity('Appointments')
export class Appointment extends BaseTimestamp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { name: 'UserId', length: 26 })
  userId: string;

  @ManyToOne(() => UsersEntity, (user) => user.userAppointments)
  @JoinColumn({ name: 'UserId' })
  user: UsersEntity;

  @OneToMany(
    () => AppointmentService,
    (appointmentService) => appointmentService.appointment,
    {
      cascade: true,
      eager: false,
    },
  )
  appointmentServices: AppointmentService[];

  @Column('varchar', { name: 'StylistId', length: 26, nullable: true })
  stylistId: string;

  @ManyToOne(() => UsersEntity, (user) => user.stylistAppointments)
  @JoinColumn({ name: 'StylistId' })
  stylist: UsersEntity;

  @Column('varchar', { name: 'BranchId', length: 36 })
  branchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'BranchId' })
  branch: Branch;

  @Column({ name: 'AppointmentDate', type: 'datetime' })
  appointmentDate: Date;

  @Column({ name: 'StartTime', type: 'time' })
  startTime: string;

  @Column({ name: 'DurationMinutes', type: 'int' })
  durationMinutes: number;

  @Column({
    name: 'Status',
    type: 'enum',
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending',
  })
  status: string;

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

  @Column({ name: 'IsPaid', default: false })
  isPaid: boolean;

  @Column({ name: 'PaymentMethod', nullable: true })
  paymentMethod: string;

  @Column({ name: 'PromotionId', nullable: true })
  promotionId: string;

  @Column({ name: 'Notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'IsReviewed', default: false })
  isReviewed: boolean;

  @OneToMany(() => Review, (review) => review.appointment)
  reviews: Review[];
}
