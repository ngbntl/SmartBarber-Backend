import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../../database/entities/review.entity';
import { ReviewRating } from '../../database/entities/review-rating.entity';
import { Appointment } from '../../database/entities/appointment.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { MessageResponse } from 'src/common/types/response';
import { MESSAGE } from 'src/common/constants/message';
import { Reviews, ReviewResponse } from './types/reviews.types';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(ReviewRating)
    private reviewRatingRepository: Repository<ReviewRating>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async getAllReviews(): Promise<Reviews> {
    try {
      const [reviews, total] = await this.reviewRepository.findAndCount({
        where: { isVisible: true },
        relations: ['ratings', 'user', 'stylist'],
        order: { createdAt: 'DESC' },
      });

      // Format response
      const formattedReviews = reviews.map((review) => {
        // Parse photos từ JSON string thành array nếu có
        if (review.photos) {
          review['photos'] = JSON.parse(review.photos);
        }

        // Thêm thông tin người dùng và stylist
        if (review.user) {
          review['userName'] =
            review.user.firstName + ' ' + review.user.lastName;
          review['userAvatar'] = review.user.avatar;
        }

        if (review.stylist) {
          review['stylistName'] =
            review.stylist.firstName + ' ' + review.stylist.lastName;
        }

        return review;
      });

      const items = plainToInstance(ReviewResponse, formattedReviews, {
        excludeExtraneousValues: true,
      });

      return { items, total };
    } catch (error) {
      throw error;
    }
  }
  async createReview(
    userId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<MessageResponse> {
    try {
      // Kiểm tra lịch hẹn có tồn tại không
      const appointment = await this.appointmentRepository.findOne({
        where: { id: createReviewDto.appointmentId },
        relations: ['user', 'stylist', 'branch'],
      });

      if (!appointment) {
        throw new NotFoundException(MESSAGE.APPOINTMENT_NOT_FOUND);
      }

      // Kiểm tra lịch hẹn có phải của người dùng hiện tại không
      if (appointment.userId !== userId) {
        throw new BadRequestException('Bạn không thể đánh giá lịch hẹn này');
      }

      // Kiểm tra lịch hẹn đã hoàn thành chưa
      if (appointment.status !== 'completed') {
        throw new BadRequestException(
          'Chỉ có thể đánh giá lịch hẹn đã hoàn thành',
        );
      }

      // Kiểm tra xem đã đánh giá trước đó chưa
      const existingReview = await this.reviewRepository.findOne({
        where: { appointmentId: createReviewDto.appointmentId },
      });

      if (existingReview) {
        throw new ConflictException('Bạn đã đánh giá lịch hẹn này trước đó');
      }

      // Lưu đánh giá mới
      const review = this.reviewRepository.create({
        userId,
        stylistId: appointment.stylistId,
        branchId: appointment.branchId,
        appointmentId: appointment.id,
        rating: createReviewDto.rating,
        comment: createReviewDto.comment || null,
        isVisible: true,
      });

      const savedReview = await this.reviewRepository.save(review);

      // Cập nhật trạng thái đã đánh giá cho lịch hẹn
      appointment.isReviewed = true;
      await this.appointmentRepository.save(appointment);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Đã đánh giá thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async getReviewsByAppointment(appointmentId: string): Promise<Review> {
    try {
      const review = await this.reviewRepository.findOne({
        where: { appointmentId },
        relations: ['ratings'],
      });

      if (!review) {
        throw new NotFoundException('Không tìm thấy đánh giá cho lịch hẹn này');
      }

      // Parse photos từ JSON string thành array nếu có
      if (review.photos) {
        review['photos'] = JSON.parse(review.photos);
      }

      return review;
    } catch (error) {
      throw error;
    }
  }

  async getReviewsByStylist(stylistId: string): Promise<Reviews> {
    try {
      const [reviews, total] = await this.reviewRepository.findAndCount({
        where: { stylistId, isVisible: true },
        relations: ['ratings', 'user', 'stylist'],
        order: { createdAt: 'DESC' },
      });

      // Format response
      const formattedReviews = reviews.map((review) => {
        // Parse photos từ JSON string thành array nếu có
        if (review.photos) {
          review['photos'] = JSON.parse(review.photos);
        }

        // Thêm thông tin người dùng và stylist
        if (review.user) {
          review['userName'] =
            review.user.firstName + ' ' + review.user.lastName;
          review['userAvatar'] = review.user.avatar;
        }

        if (review.stylist) {
          review['stylistName'] =
            review.stylist.firstName + ' ' + review.stylist.lastName;
        }

        return review;
      });

      const items = plainToInstance(ReviewResponse, formattedReviews, {
        excludeExtraneousValues: true,
      });

      return { items, total };
    } catch (error) {
      throw error;
    }
  }

  async hideReview(reviewId: string): Promise<MessageResponse> {
    try {
      const review = await this.reviewRepository.findOne({
        where: { id: reviewId },
      });

      if (!review) {
        throw new NotFoundException('Không tìm thấy đánh giá');
      }

      review.isVisible = false;
      await this.reviewRepository.save(review);

      return {
        statusCode: HttpStatus.OK,
        message: 'Đã ẩn đánh giá thành công',
      };
    } catch (error) {
      throw error;
    }
  }
}
