import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ReviewRatingResponse {
  @Expose()
  @ApiResponseProperty()
  id: string;

  @Expose()
  @ApiResponseProperty()
  reviewId: string;

  @Expose()
  @ApiResponseProperty()
  ratingCategory: string;

  @Expose()
  @ApiResponseProperty()
  score: number;
}

export class ReviewResponse {
  @Expose()
  @ApiResponseProperty()
  id: string;

  @Expose()
  @ApiResponseProperty()
  userId: string;

  @Expose()
  @ApiResponseProperty()
  stylistId: string;

  @Expose()
  @ApiResponseProperty()
  stylistName?: string;

  @Expose()
  @ApiResponseProperty()
  userName?: string;

  @Expose()
  @ApiResponseProperty()
  userAvatar?: string;

  @Expose()
  @ApiResponseProperty()
  branchId: string;

  @Expose()
  @ApiResponseProperty()
  branchName?: string;

  @Expose()
  @ApiResponseProperty()
  appointmentId: string;

  @Expose()
  @ApiResponseProperty()
  rating: number;

  @Expose()
  @ApiResponseProperty()
  comment: string;

  @Expose()
  @ApiResponseProperty({ type: [String] })
  photos: string[];

  @Expose()
  @ApiResponseProperty()
  isVisible: boolean;

  @Expose()
  @ApiResponseProperty()
  createdAt: Date;

  @Expose()
  @Type(() => ReviewRatingResponse)
  @ApiResponseProperty({ type: [ReviewRatingResponse] })
  ratings: ReviewRatingResponse[];
}

export class Reviews {
  @ApiProperty({ type: [ReviewResponse] })
  items: ReviewResponse[];

  @ApiProperty()
  total: number;
}
