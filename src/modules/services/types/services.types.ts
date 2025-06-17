import { Exclude, Expose, Type } from 'class-transformer';
import { PaginationResponse } from 'src/common/types/pagination';

export class ServicesResponse {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  @Type(() => Number)
  price: number;

  @Expose()
  duration: number;

  @Expose()
  image: string;

  @Expose()
  isActive: boolean;

  @Expose()
  bookingCount: number;
}

export class Services extends PaginationResponse<ServicesResponse> {}
