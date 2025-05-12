import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TimeSlotsService } from './time-slots.service';

@ApiTags('time-slots')
@Controller('time-slots')
export class TimeSlotsController {
  constructor(private readonly timeSlotsService: TimeSlotsService) {}

  @Get('stylist/:stylistId')
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
}
