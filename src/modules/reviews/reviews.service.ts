import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../../database/entities/review.entity';
import { ReviewRating } from '../../database/entities/review-rating.entity';
import { UsersEntity } from '../../database/entities/users.entity';
import { StylistsService } from '../stylists/stylists.service';
import { UsersService } from '../users/users.service';
import { MessageResponse } from 'src/common/types/response';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(ReviewRating)
    private reviewRatingRepository: Repository<ReviewRating>,
    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,
    private readonly stylistsService: StylistsService,
    private readonly usersService: UsersService,
  ) {}

  async createReview(
    userId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<MessageResponse> {
    try {
      // Kiểm tra stylist có tồn tại không
      await this.stylistsService.findOne(createReviewDto.stylistId);

      // Kiểm tra xem user đã đánh giá stylist này cho appointment này chưa
      if (createReviewDto.appointmentId) {
        const existingReview = await this.reviewRepository.findOne({
          where: {
            userId,
            appointmentId: createReviewDto.appointmentId,
          },
        });

        if (existingReview) {
          throw new BadRequestException(
            'Bạn đã đánh giá cho lịch hẹn này rồi',
          );
        }
      }

      // Tạo review mới
      const newReview = this.reviewRepository.create({
        userId,
        stylistId: createReviewDto.stylistId,
        branchId: createReviewDto.branchId,
        appointmentId: createReviewDto.appointmentId,
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
        photos: createReviewDto.photos ? JSON.stringify(createReviewDto.photos) : null,
        isVisible: true,
      });

      const savedReview = await this.reviewRepository.save(newReview);

      // Tạo các đánh giá chi tiết nếu có
      if (createReviewDto.detailedRatings && createReviewDto.detailedRatings.length > 0) {
        const ratingEntities = createReviewDto.detailedRatings.map((rating) => {
          // Đảm bảo category là một trong các giá trị hợp lệ
          let validCategory: 'overall' | 'cleanliness' | 'value' | 'service' = 'overall';
          if (['overall', 'cleanliness', 'value', 'service'].includes(rating.category)) {
            validCategory = rating.category as 'overall' | 'cleanliness' | 'value' | 'service';
          }
          
          return this.reviewRatingRepository.create({
            reviewId: savedReview.id,
            ratingCategory: validCategory,
            score: rating.score,
          });
        });

        await this.reviewRatingRepository.save(ratingEntities);
      }

      // Cập nhật rating trung bình cho stylist
      await this.updateStylistAverageRating(createReviewDto.stylistId);

      return {
        statusCode: 201,
        message: 'Đánh giá đã được tạo thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async getReviewsByStylist(
    stylistId: string,
    options: { page: number; limit: number },
  ): Promise<any> {
    try {
      const { page, limit } = options;
      const skip = (page - 1) * limit;

      // Kiểm tra stylist có tồn tại không
      await this.stylistsService.findOne(stylistId);

      const [reviews, total] = await this.reviewRepository.findAndCount({
        where: {
          stylistId,
          isVisible: true,
        },
        relations: ['user', 'ratings', 'appointment'],
        order: {
          createdAt: 'DESC',
        },
        skip,
        take: limit,
      });

      // Transform các đánh giá
      const items = reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        photos: review.photos ? JSON.parse(review.photos) : [],
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        user: review.user ? {
          id: review.user.id,
          firstName: review.user.firstName,
          lastName: review.user.lastName,
          avatar: review.user.avatar,
        } : null,
        detailedRatings: review.ratings ? review.ratings.map(rating => ({
          category: rating.ratingCategory,
          score: rating.score,
        })) : [],
        appointment: review.appointment ? {
          id: review.appointment.id,
          appointmentDate: review.appointment.appointmentDate,
        } : null,
      }));

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  private async updateStylistAverageRating(stylistId: string): Promise<void> {
    try {
      // Lấy tất cả các đánh giá có hiển thị của stylist
      const reviews = await this.reviewRepository.find({
        where: {
          stylistId,
          isVisible: true,
        },
      });

      // Tìm stylist từ service để cập nhật thông tin
      const stylist = await this.stylistsService.findOne(stylistId);
      if (!stylist) {
        return;
      }

      // Lấy entity stylist từ database để cập nhật
      const stylistEntity = await this.usersRepository.findOne({
        where: { id: stylistId }
      });
      
      if (!stylistEntity) {
        return;
      }

      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        
        // Chuyển đổi sang kiểu number
        stylistEntity.rating = Number(averageRating.toFixed(1));
        stylistEntity.ratingCount = reviews.length;
        await this.usersRepository.save(stylistEntity);
      } else {
        // Nếu không còn đánh giá nào, đặt về 0
        stylistEntity.rating = 0;
        stylistEntity.ratingCount = 0;
        await this.usersRepository.save(stylistEntity);
      }
    } catch (error) {
      console.error('Error updating stylist rating:', error);
    }
  }
}