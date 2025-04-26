import { Exclude, Expose } from 'class-transformer';
import { PaginationResponse } from 'src/common/types/pagination';

export class ServicesResponse {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  price: number;

  @Expose()
  duration: number;
}

export class Services extends PaginationResponse<ServicesResponse> {}
