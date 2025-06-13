import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuth } from '../../common/decorators/jwt-auth.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType } from '../../common/constants/enum';
import { User } from '../../common/decorators/current-user.decorator';
import { MessageResponse } from 'src/common/types/response';

@ApiBearerAuth()
@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @JwtAuth()
  @ApiOperation({
    summary: 'Tạo đánh giá mới cho stylist sau khi dịch vụ hoàn thành',
  })
  createReview(
    @Body() createReviewDto: CreateReviewDto,
    @User() currentUser: any,
  ): Promise<MessageResponse> {
    return this.reviewsService.createReview(currentUser.id, createReviewDto);
  }

  @Get('appointment/:appointmentId')
  @JwtAuth()
  @ApiOperation({ summary: 'Lấy đánh giá theo ID lịch hẹn' })
  getReviewByAppointment(@Param('appointmentId') appointmentId: string) {
    return this.reviewsService.getReviewsByAppointment(appointmentId);
  }

  @Get('stylist/:stylistId')
  @ApiOperation({ summary: 'Lấy tất cả đánh giá của một stylist' })
  getReviewsByStylist(@Param('stylistId') stylistId: string) {
    return this.reviewsService.getReviewsByStylist(stylistId);
  }

  @Put('hide/:reviewId')
  @JwtAuth()
  @Roles([RoleType.ADMIN, RoleType.STYLIST])
  @ApiOperation({
    summary: 'Ẩn một đánh giá (chỉ dành cho ADMIN hoặc STYLIST)',
  })
  hideReview(@Param('reviewId') reviewId: string): Promise<MessageResponse> {
    return this.reviewsService.hideReview(reviewId);
  }
}
