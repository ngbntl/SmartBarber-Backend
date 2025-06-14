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
import { CreateTimeOffDto } from './dto/create-time-off.dto';
import { UsersEntity } from '../../database/entities/users.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuth } from '../../common/decorators/jwt-auth.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { MessageResponse } from 'src/common/types/response';
import { StylistResponse, Stylists } from './types/stylists.type';
import { RoleType } from 'src/common/constants/enum';
import { UpdateStylistDto } from './dto/update-stylist.dto';

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

  @Get('branch/:branchId')
  @ApiOperation({ summary: 'Lấy danh sách thợ cắt tóc theo chi nhánh' })
  findByBranch(@Param('branchId') branchId: string): Promise<Stylists> {
    return this.stylistsService.findByBranch(branchId);
  }

  @Get('schedule/:stylistId')
  @ApiOperation({ summary: 'Lấy lịch làm việc trong 7 ngày của stylist' })
  getWeeklySchedule(@Param('stylistId') stylistId: string) {
    return this.stylistsService.getWeeklySchedule(stylistId);
  }

  @Get('time-offs/:stylistId')
  @ApiOperation({ summary: 'Lấy danh sách các ngày nghỉ của stylist' })
  getStylistTimeOffs(
    @Param('stylistId') stylistId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.stylistsService.getStylistTimeOffs(
      stylistId,
      startDate,
      endDate,
    );
  }

  @Post('time-off')
  @JwtAuth()
  @ApiOperation({ summary: 'Đặt ngày nghỉ cho stylist' })
  createTimeOff(
    @Body() createTimeOffDto: CreateTimeOffDto,
  ): Promise<MessageResponse> {
    return this.stylistsService.createTimeOff(createTimeOffDto);
  }

  @Delete('time-off/:id')
  @JwtAuth()
  @ApiOperation({ summary: 'Xóa ngày nghỉ của stylist' })
  deleteTimeOff(@Param('id') id: string): Promise<MessageResponse> {
    return this.stylistsService.deleteTimeOff(id);
  }

  @Put(':id')
  @JwtAuth()
  @Roles([RoleType.ADMIN, RoleType.STYLIST])
  @ApiOperation({ summary: 'Cập nhật thông tin thợ cắt tóc' })
  update(
    @Param('id') id: string,
    @Body() updateStylistDto: UpdateStylistDto,
  ): Promise<MessageResponse> {
    return this.stylistsService.update(id, updateStylistDto);
  }
}
