import { ApiProperty } from '@nestjs/swagger';
import { Pagination } from 'src/common/types/pagination';

export class UserQuery extends Pagination {
  @ApiProperty()
  filter?: string;

  @ApiProperty()
  role?: string;

  @ApiProperty()
  accountStatus?: boolean;

  @ApiProperty()
  userType?: string;

  @ApiProperty()
  position?: string;

  @ApiProperty()
  versionUsing?: any;

  @ApiProperty()
  startDate?: string;

  @ApiProperty()
  endDate?: string;

  @ApiProperty()
  isManage?: boolean;
}
