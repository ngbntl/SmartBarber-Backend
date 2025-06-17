import { Expose } from 'class-transformer';
import { PaginationResponse } from 'src/common/types/pagination';

export class PromotionsResponse {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  code: string;

  @Expose()
  description: string;

  @Expose()
  discountAmount: number;

  @Expose()
  discountPercent: number;

  @Expose()
  minimumPurchaseAmount: number;

  @Expose()
  isPercentage: boolean;

  @Expose()
  applicableServiceIds: string[];

  @Expose()
  isActive: boolean;

  @Expose()
  startDate: Date;

  @Expose()
  endDate: Date;
}

export class Promotions extends PaginationResponse<PromotionsResponse> {}
