import { Exclude } from 'class-transformer';
import { Entity, PrimaryColumn, Column, Index, Unique } from 'typeorm';

@Exclude()
@Entity('Users')
export class UsersEntity {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column('bigint', { name: 'CreateAt', nullable: true })
  createAt: number;

  @Column('bigint', { name: 'UpdateAt', nullable: true })
  updateAt: number;

  @Column('bigint', { name: 'DeleteAt', nullable: true })
  deleteAt: number;

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

  @Column('varchar', { name: 'Nickname', length: 64, nullable: true })
  nickname: string;

  @Column('varchar', { name: 'FirstName', length: 64, nullable: true })
  firstName: string;

  @Column('varchar', { name: 'LastName', length: 64, nullable: true })
  lastName: string;

  @Column('text', { name: 'Roles', nullable: true })
  roles: string;

  @Column('tinyint', { name: 'AllowMarketing', nullable: true })
  allowMarketing: number;

  @Column('json', { name: 'Props', nullable: true })
  props: Record<string, any>;

  @Column('json', { name: 'NotifyProps', nullable: true })
  notifyProps: Record<string, any>;

  @Column('bigint', { name: 'LastPasswordUpdate', nullable: true })
  lastPasswordUpdate: number;

  @Column('bigint', { name: 'LastPictureUpdate', nullable: true })
  lastPictureUpdate: number;

  @Column('int', { name: 'FailedAttempts', nullable: true })
  failedAttempts: number;

  @Column('varchar', { name: 'Locale', length: 5, nullable: true })
  locale: string;

  @Column('varchar', { name: 'Position', length: 128, nullable: true })
  position: string;

  @Column('json', { name: 'Timezone', nullable: true })
  timezone: Record<string, any>;

  @Column('varchar', { name: 'RemoteId', length: 26, nullable: true })
  remoteId: string;
}
