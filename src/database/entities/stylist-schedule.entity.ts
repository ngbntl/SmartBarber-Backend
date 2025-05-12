import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsersEntity } from './users.entity';

@Entity('stylist_schedules')
export class StylistSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'StylistId', nullable: false })
  stylistId: string;

  @Column({
    type: 'enum',
    enum: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
    name: 'DayOfWeek',
  })
  dayOfWeek: string;

  @Column({ default: true, name: 'IsWorking' })
  isWorking: boolean;

  @ManyToOne(() => UsersEntity)
  @JoinColumn({ name: 'StylistId' })
  stylist: UsersEntity;

}
