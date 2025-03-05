import { Expose, Transform } from 'class-transformer';
import { PaginationResponse } from 'src/common/types/pagination';

export class Client {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  clientId: string;

  @Expose()
  clientSecret: string;

  @Expose()
  redirectUrl: string;

  // @Expose()
  // scope: string;

  @Expose()
  @Transform(({ obj }) => new Date(parseInt(obj.createAt, 10)))
  createAt?: Date;
}

export class Clients extends PaginationResponse<Client> {}
