import { ApiProperty } from '@nestjs/swagger';

export class Pagination {
  @ApiProperty({ default: 1 })
  currentPage: number = 1;

  @ApiProperty({ default: 10 })
  perPage: number = 10;
}

export class PaginationResponse<T> {
  items: T[];
  total: number;

  constructor(items: T[], total: number) {
    this.items = items;
    this.total = total;
  }
}
