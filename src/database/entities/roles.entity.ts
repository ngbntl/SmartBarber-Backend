import { Exclude } from 'class-transformer';
import { Entity, PrimaryColumn, Column } from 'typeorm';
import { BaseTimestamp } from './base-timestamp';

@Exclude()
@Entity('Roles')
export class RolesEntity extends BaseTimestamp {
  @PrimaryColumn('varchar', { name: 'Id', length: 26 })
  id: string;

  // Role information
  @Column('varchar', { name: 'Name', length: 64, nullable: true })
  name: string;

  @Column('varchar', { name: 'DisplayName', length: 128, nullable: true })
  displayName: string;

  @Column('text', { name: 'Description', nullable: true })
  description: string;

  // Permissions and configuration
  @Column('longtext', { name: 'Permissions', nullable: true })
  permissions: string;

  // Role type
  @Column('tinyint', { name: 'SchemeManaged', nullable: true })
  schemeManaged: number;

  @Column('tinyint', { name: 'BuiltIn', nullable: true })
  builtIn: number;
}
