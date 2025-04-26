import { Expose } from 'class-transformer';
import { PaginationResponse } from 'src/common/types/pagination';

export class StylistResponse {
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  avatar: string;

  @Expose()
  bio: string;

  @Expose()
  specialization: string;

  @Expose()
  rating: string;

  @Expose()
  ratingCount: number;

  @Expose()
  experienceYears: number;

  @Expose()
  isActive: boolean;

  @Expose()
  branchId: string;
}

export class Stylists extends PaginationResponse<StylistResponse> {}
