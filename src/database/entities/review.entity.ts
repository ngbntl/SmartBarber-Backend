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

  // User relationship
  @Column()
  userId: string;

  @ManyToOne(() => UsersEntity)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;

  // Stylist relationship (tham chiếu tới user có role là stylist)
  @Column({ nullable: true })
  stylistId: string;

  @ManyToOne(() => UsersEntity)
  @JoinColumn({ name: 'stylistId' })
  stylist: UsersEntity;

  // Branch relationship
  @Column({ nullable: true })
  branchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  // Appointment relationship
  @Column({ nullable: true })
  appointmentId: string; // Thay đổi từ number sang string do appointment.id là uuid

  @ManyToOne(() => Appointment)
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  // Review details - only overall score, chi tiết được chuyển sang bảng review_ratings
  @Column({ type: 'int' })
  rating: number; // 1-5 stars (điểm tổng quan)

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ nullable: true })
  photos: string; // JSON array of photo URLs

  // Review status
  @Column({ default: true })
  isVisible: boolean;

  // Review ratings relationship
  @OneToMany(() => ReviewRating, (rating) => rating.review)
  ratings: ReviewRating[];
}
