import { Expose } from 'class-transformer';
import { PaginationResponse } from 'src/common/types/pagination';

export class TimeSlotResponse {
  @Expose()
  startTime: string;
  @Expose()
  endTime: string;
  @Expose()
  isAvailable: boolean;
}
export class TimeSlots extends PaginationResponse<TimeSlotResponse> {}
