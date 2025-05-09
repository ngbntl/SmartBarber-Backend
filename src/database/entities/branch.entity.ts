import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UsersEntity } from './users.entity';
import { Appointment } from './appointment.entity';
import { BaseTimestamp } from './base-timestamp';

@Entity('branches')
export class Branch extends BaseTimestamp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Location information
  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  district: string;

  @Column({ nullable: true })
  phone: string;

  // Branch details
  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  image: string;

  // Ratings
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  ratingCount: number;

  // Status
  @Column({ default: true })
  isActive: boolean;

  // Working hours
  @Column({ type: 'time' })
  openTime: string;

  @Column({ type: 'time' })
  closeTime: string;

  // Relationships
  @OneToMany(() => UsersEntity, (user) => user.branch)
  stylists: UsersEntity[];

  @OneToMany(() => Appointment, (appointment) => appointment.branch)
  appointments: Appointment[];
}
