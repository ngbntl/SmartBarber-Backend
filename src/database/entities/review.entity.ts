import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { UsersEntity } from './users.entity';
import { Branch } from './branch.entity';
import { Appointment } from './appointment.entity';
import { BaseTimestamp } from './base-timestamp';
import { ReviewRating } from './review-rating.entity';

@Entity('reviews')
export class Review extends BaseTimestamp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => UsersEntity)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;

  @Column({ nullable: true })
  stylistId: string;

  @ManyToOne(() => UsersEntity)
  @JoinColumn({ name: 'stylistId' })
  stylist: UsersEntity;

  @Column({ nullable: true })
  branchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @Column({ nullable: true })
  appointmentId: string;

  @ManyToOne(() => Appointment)
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ nullable: true })
  photos: string;

  @Column({ default: true })
  isVisible: boolean;

  @OneToMany(() => ReviewRating, (rating) => rating.review)
  ratings: ReviewRating[];
}
