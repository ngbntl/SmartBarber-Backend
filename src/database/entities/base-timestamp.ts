import { Column, BeforeInsert, BeforeUpdate } from 'typeorm';

export abstract class BaseTimestamp {
  @Column('bigint', { name: 'created_at', nullable: true })
  createdAt?: number;

  @Column('bigint', { name: 'updated_at', nullable: true })
  updatedAt?: number;

  @Column('bigint', { name: 'deleted_at', nullable: true })
  deletedAt?: number;

  @BeforeInsert()
  setCreatedAt() {
    const now = Date.now();
    this.createdAt = now;
    this.updatedAt = now;
  }

  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = Date.now();
  }
}
