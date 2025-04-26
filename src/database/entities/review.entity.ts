import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsersEntity } from './users.entity';
import { Stylist } from './stylist.entity';
import { Branch } from './branch.entity';
import { Appointment } from './appointment.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => UsersEntity)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;

  @Column({ nullable: true })
  stylistId: string;

  @ManyToOne(() => Stylist)
  @JoinColumn({ name: 'stylistId' })
  stylist: Stylist;

  @Column({ nullable: true })
  branchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @Column({ nullable: true })
  appointmentId: number;

  @ManyToOne(() => Appointment)
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @Column({ type: 'int' })
  rating: number; // 1-5 stars

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ nullable: true })
  photos: string; // JSON array of photo URLs

  @Column({ default: true })
  isVisible: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
