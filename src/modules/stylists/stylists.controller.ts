import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { StylistsService } from './stylists.service';
import { CreateStylistDto } from './dto/create-stylist.dto';
import { UsersEntity } from '../../database/entities/users.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuth } from '../../common/decorators/jwt-auth.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { MessageResponse } from 'src/common/types/response';
import { StylistResponse, Stylists } from './types/stylists.type';
import { RoleType } from 'src/common/constants/enum';

@ApiTags('stylists')
@ApiBearerAuth()
@Controller('stylists')
export class StylistsController {
  constructor(private readonly stylistsService: StylistsService) {}

  @Post()
  @JwtAuth()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Tạo thợ cắt tóc mới' })
  create(@Body() createStylistDto: CreateStylistDto): Promise<MessageResponse> {
    return this.stylistsService.create(createStylistDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả thợ cắt tóc' })
  findAll(): Promise<Stylists> {
    return this.stylistsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết thợ cắt tóc' })
  findOne(@Param('id') id: string): Promise<StylistResponse> {
    return this.stylistsService.findOne(id);
  }
}
