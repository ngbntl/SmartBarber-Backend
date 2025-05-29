import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuth } from '../../common/decorators/jwt-auth.decorator';
import { User } from '../../common/decorators/current-user.decorator';
import { MessageResponse } from 'src/common/types/response';
import { CreateReviewDto } from './dto/create-review.dto';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @JwtAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo đánh giá mới' })
  createReview(
    @Body() createReviewDto: CreateReviewDto,
    @User() currentUser: any,
  ): Promise<MessageResponse> {
    return this.reviewsService.createReview(currentUser.id, createReviewDto);
  }

  @Get('stylist/:stylistId')
  @ApiOperation({ summary: 'Lấy danh sách đánh giá của một stylist' })
  getReviewsByStylist(
    @Param('stylistId') stylistId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<any> {
    return this.reviewsService.getReviewsByStylist(stylistId, { page, limit });
  }
}
