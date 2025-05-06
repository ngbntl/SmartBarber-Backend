import { Expose } from 'class-transformer';
import { PaginationResponse } from 'src/common/types/pagination';

export class BranchesResponse {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  city: string;

  @Expose()
  district: string;

  @Expose()
  address: string;

  @Expose()
  isActive: boolean;

  @Expose()
  phone: string;

  @Expose()
  description: string;

  @Expose()
  image: string;

  @Expose()
  rating: string;

  @Expose()
  ratingCount: number;

  @Expose()
  openTime: string;

  @Expose()
  closeTime: string;
}

export class Branches extends PaginationResponse<BranchesResponse> {}
