import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Service } from './service.entity';
import { BaseTimestamp } from './base-timestamp';

@Entity('promotions')
export class Promotion extends BaseTimestamp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Promotion basic information
  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  image: string;

  // Discount configuration
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercent: number;

  @Column({ default: false })
  isPercentage: boolean;

  // Validity period
  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;

  // Status
  @Column({ default: true })
  isActive: boolean;

  // Usage configuration
  @Column({ nullable: true })
  code: string;

  @Column({ type: 'int', default: -1 })
  usageLimit: number; // -1 means unlimited

  @Column({ type: 'int', default: 0 })
  usedCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minimumPurchaseAmount: number;

  // Relationships
  @ManyToMany(() => Service)
  @JoinTable({
    name: 'promotion_services',
    joinColumn: { name: 'promotionId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'serviceId', referencedColumnName: 'id' },
  })
  applicableServices: Service[];
}
