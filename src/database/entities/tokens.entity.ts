import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTimestamp } from './base-timestamp';

@Entity('Tokens')
export class TokensEntity extends BaseTimestamp {
  @PrimaryGeneratedColumn('uuid', { name: 'Id' })
  id: string;

  // Token values
  @Column({
    nullable: false,
    name: 'RefreshToken',
    length: 4096,
  })
  refreshToken: string;

  // Public keys
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

  // User relationship
  @Column({
    nullable: false,
    name: 'UserId',
  })
  userId: string;

  // Token expiration
  @Column({
    nullable: false,
    name: 'ExpireAt',
  })
  expireAt: Date;
}
