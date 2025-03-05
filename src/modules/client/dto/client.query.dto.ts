import { ApiPropertyOptional } from '@nestjs/swagger';
import { Pagination } from 'src/common/types/pagination';

export class ClientQuery extends Pagination {
  @ApiPropertyOptional()
  filter?: string;
}
