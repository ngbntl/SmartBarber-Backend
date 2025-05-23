import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuth } from '../../common/decorators/jwt-auth.decorator';
import { Appointments } from './types/appointments.types';
import { MessageResponse } from 'src/common/types/response';

@ApiBearerAuth()
@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @JwtAuth()
  @ApiOperation({ summary: 'Tạo lịch hẹn mới' })
  createAppointment(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.createAppointment(createAppointmentDto);
  }

  @Get('user/:userId')
  @JwtAuth()
  @ApiOperation({ summary: 'Lấy danh sách lịch hẹn của người dùng' })
  getAppointmentsByUser(
    @Param('userId') userId: string,
  ): Promise<Appointments> {
    return this.appointmentsService.getAppointmentsByUser(userId);
  }

  @Get('stylist/:stylistId')
  @JwtAuth()
  @ApiOperation({ summary: 'Lấy danh sách lịch hẹn của stylist' })
  getAppointmentsByStylist(
    @Param('stylistId') stylistId: string,
  ): Promise<Appointments> {
    return this.appointmentsService.getAppointmentsByStylist(stylistId);
  }

  @Post('cancel/:appointmentId')
  @JwtAuth()
  @ApiOperation({ summary: 'Hủy lịch hẹn' })
  cancelAppointment(
    @Param('appointmentId') appointmentId: string,
  ): Promise<MessageResponse> {
    return this.appointmentsService.cancelAppointment(appointmentId);
  }
}
