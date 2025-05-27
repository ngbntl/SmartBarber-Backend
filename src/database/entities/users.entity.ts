import { Exclude } from 'class-transformer';
import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Appointment } from './appointment.entity';
import { RoleType } from '../../common/constants/enum';
import { BaseTimestamp } from './base-timestamp';
import { Branch } from './branch.entity';
import { StylistSchedule } from './stylist-schedule.entity';
import { StylistTimeOff } from './stylist-time-off.entity';

@Exclude()
@Entity('Users')
export class UsersEntity extends BaseTimestamp {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column('varchar', { name: 'Username', length: 64, nullable: true })
  username: string;

  @Column('varchar', { name: 'Password', length: 128, nullable: true })
  password: string;

  @Column('varchar', { name: 'AuthData', length: 128, nullable: true })
  authData: string;

  @Column('varchar', { name: 'AuthService', length: 32, nullable: true })
  authService: string;

  @Column('varchar', { name: 'Email', length: 128, nullable: true })
  email: string;

  @Column('tinyint', { name: 'EmailVerified', nullable: true })
  emailVerified: number;

  @Column('varchar', { name: 'FirstName', length: 64, nullable: true })
  firstName: string;

  @Column('varchar', { name: 'LastName', length: 64, nullable: true })
  lastName: string;

  @Column({
    name: 'RoleType',
    type: 'enum',
    enum: RoleType,
    default: RoleType.USER,
  })
  roleType: RoleType;

  @Column('json', { name: 'Props', nullable: true })
  props: Record<string, any>;

  @Column('json', { name: 'NotifyProps', nullable: true })
  notifyProps: Record<string, any>;

  @Column('varchar', { name: 'Locale', length: 5, nullable: true })
  locale: string;

  @Column('json', { name: 'Timezone', nullable: true })
  timezone: Record<string, any>;

  @Column('bigint', { name: 'LastPasswordUpdate', nullable: true })
  lastPasswordUpdate: number;

  @Column('int', { name: 'FailedAttempts', nullable: true })
  failedAttempts: number;

  @Column('bigint', { name: 'LastPictureUpdate', nullable: true })
  lastPictureUpdate: number;

  @Column('varchar', { name: 'Position', length: 128, nullable: true })
  position: string;

  @Column('varchar', { name: 'RemoteId', length: 26, nullable: true })
  remoteId: string;

  @Column({ name: 'Avatar', nullable: true })
  avatar: string;

  @Column({ name: 'Bio', nullable: true, type: 'text' })
  bio: string;

  @Column({ name: 'Specialization', nullable: true })
  specialization: string;

  @Column({
    name: 'Rating',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
  })
  rating: number;

  @Column({ name: 'RatingCount', type: 'int', default: 0 })
  ratingCount: number;

  @Column({ name: 'ExperienceYears', type: 'int', default: 0 })
  experienceYears: number;

  @Column({ name: 'IsActive', default: false })
  isActive: boolean;

  @Column({ name: 'BranchId', nullable: true })
  branchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'BranchId' })
  branch: Branch;

  @OneToMany(() => Appointment, (appointment) => appointment.user)
  userAppointments: Appointment[];

  @OneToMany(() => Appointment, (appointment) => appointment.stylist)
  stylistAppointments: Appointment[];

  @OneToMany(() => StylistSchedule, (schedule) => schedule.stylist)
  schedules: StylistSchedule[];

  @OneToMany(() => StylistTimeOff, (timeOff) => timeOff.stylist)
  timeOffs: StylistTimeOff[];
}
