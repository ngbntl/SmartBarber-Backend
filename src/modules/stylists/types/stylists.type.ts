import { Expose, Type } from 'class-transformer';
import { PaginationResponse } from 'src/common/types/pagination';

export class StylistResponse {
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  avatar: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  email: string;

  @Expose()
  bio: string;

  @Expose()
  specialization: string;

  @Expose()
  rating: string;

  @Expose()
  ratingCount: number;

  @Expose()
  experienceYears: number;

  @Expose()
  isActive: boolean;

  @Expose()
  branchId: string;
}

export class Stylists extends PaginationResponse<StylistResponse> {}

// Định nghĩa kiểu dữ liệu cho một ngày trong lịch làm việc
export class DailySchedule {
  @Expose()
  date: string; // YYYY-MM-DD

  @Expose()
  dayOfWeek: string; // Monday, Tuesday, ...

  @Expose()
  isWorking: boolean;
}

// Định nghĩa kiểu dữ liệu lịch làm việc trong tuần
export class WeeklySchedule {
  @Expose()
  stylistId: string;

  @Expose()
  @Type(() => DailySchedule)
  days: DailySchedule[];
}

export class StylistTimeOffResponse {
  @Expose()
  id: string;

  @Expose()
  stylistId: string;

  @Expose()
  date: string;

  @Expose()
  startTime: string;

  @Expose()
  endTime: string;

  @Expose()
  reason: string;

  @Expose()
  isFullDay: boolean;
}

export class StylistTimeOffs extends PaginationResponse<StylistTimeOffResponse> {}
