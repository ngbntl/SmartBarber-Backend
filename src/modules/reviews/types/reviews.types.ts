import { Expose, Type } from 'class-transformer';
import { PaginationResponse } from 'src/common/types/pagination';

export class UserInfoResponse {
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  avatar: string;
}

export class StylistInfoResponse {
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  avatar: string;

  @Expose()
  rating: string;

  @Expose()
  ratingCount: number;
}

export class BranchInfoResponse {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  address: string;
}

export class AppointmentInfoResponse {
  @Expose()
  id: string;

  @Expose()
  appointmentDate: Date;

  @Expose()
  startTime: string;
}

export class DetailedRatingResponse {
  @Expose()
  category: string;

  @Expose()
  score: number;
}

export class ReviewResponse {
  @Expose()
  id: string;

  @Expose()
  rating: number;

  @Expose()
  comment: string;

  @Expose()
  photos: string[];

  @Expose()
  createdAt: number;

  @Expose()
  updatedAt: number;

  @Expose()
  @Type(() => UserInfoResponse)
  user: UserInfoResponse;

  @Expose()
  @Type(() => DetailedRatingResponse)
  detailedRatings: DetailedRatingResponse[];

  @Expose()
  @Type(() => AppointmentInfoResponse)
  appointment?: AppointmentInfoResponse;
}

export class DetailedReviewResponse extends ReviewResponse {
  @Expose()
  @Type(() => StylistInfoResponse)
  stylist?: StylistInfoResponse;

  @Expose()
  @Type(() => BranchInfoResponse)
  branch?: BranchInfoResponse;
}

export class Reviews extends PaginationResponse<ReviewResponse> {}