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
import { Stylist } from './stylist.entity';
import { Branch } from './branch.entity';
import { Review } from './review.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UsersEntity)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;

  @Column()
  userId: string;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @Column()
  serviceId: string;

  @ManyToOne(() => Stylist)
  @JoinColumn({ name: 'stylistId' })
  stylist: Stylist;

  @Column({ nullable: true })
  stylistId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @Column()
  branchId: string;

  @Column({ type: 'datetime' })
  appointmentDate: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  finalAmount: number;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  promotionId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  isReviewed: boolean;

  @OneToMany(() => Review, (review) => review.appointment)
  reviews: Review[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
