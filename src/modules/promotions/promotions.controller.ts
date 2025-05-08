import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Promotion } from '../../database/entities/promotion.entity';
import { JwtAuth } from '../../common/decorators/jwt-auth.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType } from 'src/common/constants/enum';

@ApiTags('promotions')
@ApiBearerAuth()
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @JwtAuth()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Tạo khuyến mãi mới' })
  @ApiResponse({
    status: 201,
    description: 'Khuyến mãi được tạo thành công',
    type: Promotion,
  })
  create(@Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionsService.create(createPromotionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả khuyến mãi' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  findAll(@Query('activeOnly') activeOnly: boolean = false) {
    return this.promotionsService.findAll(activeOnly);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết khuyến mãi' })
  findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(id);
  }
}
