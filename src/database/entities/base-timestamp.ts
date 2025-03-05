import { Column } from 'typeorm';

export abstract class BaseTimestamp {
  @Column('bigint', { name: 'CreateAt', default: null })
  createAt?: number;

  @Column('bigint', { name: 'UpdateAt', default: null })
  updateAt?: number;

  @Column('bigint', { name: 'DeleteAt', default: null })
  deleteAt?: number;
}
