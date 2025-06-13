import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Review } from '../../database/entities/review.entity';
import { ReviewRating } from '../../database/entities/review-rating.entity';
import { Appointment } from '../../database/entities/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, ReviewRating, Appointment])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
