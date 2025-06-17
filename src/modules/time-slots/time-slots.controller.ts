import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TimeSlotsService } from './time-slots.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateTimeSlotTemplateDto } from './dto/create-time-slot-template.dto';
import { UpdateTimeSlotTemplateDto } from './dto/update-time-slot-template.dto';
import { RoleType } from 'src/common/constants/enum';
import { JwtAuth } from 'src/common/decorators/jwt-auth.decorator';

@ApiTags('time-slots')
@ApiBearerAuth()
@Controller('time-slots')
export class TimeSlotsController {
  constructor(private readonly timeSlotsService: TimeSlotsService) {}

  @Get('stylist/:stylistId')
  @JwtAuth()
  @ApiOperation({ summary: 'Lấy danh sách khung giờ rảnh của một stylist' })
  async getAvailableTimeSlotsByStylist(
    @Param('stylistId') stylistId: string,
    @Query('date') date?: string,
  ) {
    return await this.timeSlotsService.getAvailableTimeSlotsByStylist(
      stylistId,
      date,
    );
  }

  @Get('status/stylist/:stylistId')
  @JwtAuth()
  @ApiOperation({
    summary: 'Lấy trạng thái của tất cả khung giờ trong một ngày',
  })
  async getTimeSlotStatusByDate(
    @Param('stylistId') stylistId: string,
    @Query('date') date: string,
  ) {
    return await this.timeSlotsService.getTimeSlotStatusByDate(stylistId, date);
  }

  @Get('templates')
  @JwtAuth()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Lấy tất cả khung giờ mẫu (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tất cả các khung giờ mẫu',
  })
  async getAllTimeSlotTemplates() {
    return await this.timeSlotsService.getAllTimeSlotTemplates();
  }

  @Get('templates/:id')
  @JwtAuth()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Lấy chi tiết một khung giờ mẫu (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin chi tiết khung giờ',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy khung giờ',
  })
  async getTimeSlotTemplateById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.timeSlotsService.getTimeSlotTemplateById(id);
  }

  @Post('templates')
  @JwtAuth()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Tạo khung giờ mẫu mới (Admin)' })
  @ApiResponse({
    status: 201,
    description: 'Khung giờ mẫu đã được tạo thành công',
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ',
  })
  async createTimeSlotTemplate(@Body() createDto: CreateTimeSlotTemplateDto) {
    return await this.timeSlotsService.createTimeSlotTemplate(
      createDto.startTime,
      createDto.endTime,
      createDto.description,
    );
  }

  @Put('templates/:id')
  @JwtAuth()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Cập nhật khung giờ mẫu (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Khung giờ mẫu đã được cập nhật thành công',
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy khung giờ',
  })
  async updateTimeSlotTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTimeSlotTemplateDto,
  ) {
    return await this.timeSlotsService.updateTimeSlotTemplate(
      id,
      updateDto.startTime,
      updateDto.endTime,
      updateDto.description,
      updateDto.isActive,
    );
  }

  @Delete('templates/:id')
  @JwtAuth()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Xóa hoặc vô hiệu hóa khung giờ mẫu (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Khung giờ mẫu đã được xóa hoặc vô hiệu hóa thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy khung giờ',
  })
  async deleteTimeSlotTemplate(@Param('id', ParseUUIDPipe) id: string) {
    return await this.timeSlotsService.deleteTimeSlotTemplate(id);
  }
}
