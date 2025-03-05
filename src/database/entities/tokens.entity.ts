import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTimestamp } from './base-timestamp';

@Entity('IW_Tokens')
export class TokensEntity extends BaseTimestamp {
  @PrimaryGeneratedColumn('uuid', { name: 'Id' })
  id: string;

  @Column({
    nullable: false,
    name: 'RefreshToken',
    length: 4096,
  })
  refreshToken: string;

  @Column({
    nullable: false,
    name: 'refreshPublicKey',
    length: 4096,
  })
  refreshPublicKey: string;

  @Column({
    nullable: false,
    name: 'accessPublicKey',
    length: 4096,
  })
  accessPublicKey: string;

  @Column({
    nullable: false,
    name: 'UserId',
  })
  userId: string;

  @Column({
    nullable: false,
    name: 'ExpireAt',
  })
  expireAt: Date;
}
