import { Expose } from 'class-transformer';
import { PaginationResponse } from 'src/common/types/pagination';

export class TimeSlotResponse {
  @Expose()
  id: string;

  @Expose()
  startTime: string;

  @Expose()
  endTime: string;

  @Expose()
  isAvailable: boolean;

  @Expose()
  description?: string;
}
export class TimeSlots extends PaginationResponse<TimeSlotResponse> {}
