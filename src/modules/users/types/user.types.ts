import { Expose, Transform } from 'class-transformer';
import { PaginationResponse } from 'src/common/types/pagination';

export class UserResponse {
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  username?: string;

  @Expose()
  lastName: string;

  @Expose()
  @Transform(({ obj }) =>
    obj.firstName && obj.lastName ? obj.firstName + ' ' + obj.lastName : '',
  )
  fullName: string;

  @Expose()
  emailVerified: boolean;

  @Expose()
  email: string;

  @Expose()
  phoneNumber?: string;

  @Expose()
  specialization?: string;

  @Expose()
  experienceYears?: number;

  @Expose()
  avatar?: string;

  @Expose()
  roleType: string;

  @Expose()
  isActive: boolean;

  @Expose()
  @Transform(({ obj }) => new Date(parseInt(obj.createAt, 10)))
  createAt?: Date;

  @Expose()
  @Transform(({ obj }) =>
    parseInt(obj.updateAt) === 0 ? null : new Date(parseInt(obj.updateAt, 10)),
  )
  updateAt?: Date;

  @Expose()
  @Transform(({ obj }) =>
    parseInt(obj.deleteAt) === 0 ? null : new Date(parseInt(obj.deleteAt, 10)),
  )
  deleteAt?: Date;
}

export class Users extends PaginationResponse<UserResponse> {}
