import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseTimestamp } from './base-timestamp';

export enum Scope {
  DEFAULT = 'default',
  FULL = 'full',
}

@Entity('IW_Clients')
export class ClientsEntity extends BaseTimestamp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'Name' })
  name: string;

  @Column({ name: 'ClientId', nullable: true })
  clientId?: string;

  @Column({ name: 'ClientSecret', nullable: true })
  clientSecret?: string;

  @Column({ name: 'RedirectUrl', nullable: true })
  redirectUrl?: string;

  @Column({
    type: 'enum',
    enum: Scope,
    default: Scope.DEFAULT,
    name: 'Scope',
  })
  scope: Scope;
}
