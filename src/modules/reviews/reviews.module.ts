import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Review } from '../../database/entities/review.entity';
// Loại bỏ import ReviewRating
import { Appointment } from '../../database/entities/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Appointment])], // Loại bỏ ReviewRating
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
