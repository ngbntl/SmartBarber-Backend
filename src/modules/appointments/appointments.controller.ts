import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import {
  CreateAppointmentDto,
  ConfirmAppointmentDto,
} from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

import { JwtAuth } from '../../common/decorators/jwt-auth.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType } from '../../common/constants/enum';
import { Appointments } from './types/appointments.types';
import { MessageResponse } from 'src/common/types/response';
import { User } from 'src/common/decorators/current-user.decorator';
import { EmergencyCancelDto } from './dto/emergency-cancel.dto';
import { ReassignAppointmentDto } from './dto/reassign-appointment.dto';

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

  @Put('cancel/:appointmentId')
  @JwtAuth()
  @ApiOperation({ summary: 'Hủy lịch hẹn' })
  cancelAppointment(
    @Param('appointmentId') appointmentId: string,
    @User() currentUser: any,
  ): Promise<MessageResponse> {
    return this.appointmentsService.cancelAppointment(
      appointmentId,
      currentUser?.id,
    );
  }

  @Put('confirm/:appointmentId')
  @JwtAuth()
  @Roles([RoleType.STYLIST])
  @ApiOperation({ summary: 'Stylist xác nhận lịch hẹn của người dùng' })
  confirmAppointment(
    @Param('appointmentId') appointmentId: string,
    @Body() confirmAppointmentDto: ConfirmAppointmentDto,
    @User() currentUser: any,
  ): Promise<MessageResponse> {
    return this.appointmentsService.confirmAppointment(
      appointmentId,
      currentUser?.id,
      confirmAppointmentDto.stylistNote,
    );
  }

  @Get(':appointmentId')
  @JwtAuth()
  @ApiOperation({ summary: 'Lấy chi tiết lịch hẹn theo ID' })
  getAppointmentById(@Param('appointmentId') appointmentId: string) {
    return this.appointmentsService.getAppointmentById(appointmentId);
  }

  @Put('status/:appointmentId')
  @JwtAuth()
  @Roles([RoleType.STYLIST])
  @ApiOperation({
    summary:
      'Stylist cập nhật trạng thái lịch hẹn (completed, cancelled, no-show)',
  })
  updateAppointmentStatus(
    @Param('appointmentId') appointmentId: string,
    @Body() updateStatusDto: UpdateAppointmentStatusDto,
    @User() currentUser: any,
  ): Promise<MessageResponse> {
    return this.appointmentsService.updateAppointmentStatus(
      appointmentId,
      currentUser?.id,
      updateStatusDto,
    );
  }

  @Get('today/branch/:branchId')
  @JwtAuth()
  @ApiQuery({
    name: 'stylistId',
    required: false,
    description: 'Lọc theo stylist cụ thể (tùy chọn)',
  })
  @ApiOperation({
    summary: 'Lấy danh sách lịch hẹn trong ngày của một chi nhánh',
  })
  getTodayAppointments(
    @Param('branchId') branchId: string,
    @Query('stylistId') stylistId?: string,
  ): Promise<Appointments> {
    return this.appointmentsService.getTodayAppointments(branchId, stylistId);
  }

  @Get('upcoming/user/:userId')
  @JwtAuth()
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Số ngày sắp tới (mặc định là 7 ngày)',
  })
  @ApiOperation({ summary: 'Lấy danh sách lịch hẹn sắp tới của người dùng' })
  getUpcomingAppointments(
    @Param('userId') userId: string,
    @Query('days') days?: number,
  ): Promise<Appointments> {
    return this.appointmentsService.getUpcomingAppointments(
      userId,
      days ? +days : 7,
    );
  }

  @Put('emergency-cancel/:appointmentId')
  @JwtAuth()
  @Roles([RoleType.STYLIST])
  @ApiOperation({ summary: 'Stylist hủy lịch hẹn trong trường hợp khẩn cấp' })
  emergencyCancelAppointment(
    @Param('appointmentId') appointmentId: string,
    @Body() emergencyCancelDto: EmergencyCancelDto,
    @User() currentUser: any,
  ): Promise<MessageResponse> {
    return this.appointmentsService.emergencyCancelAppointment(
      appointmentId,
      currentUser?.id,
      emergencyCancelDto.emergencyReason,
    );
  }

  @Put('reassign/:appointmentId')
  @JwtAuth()
  @Roles([RoleType.STYLIST, RoleType.ADMIN])
  @ApiOperation({ summary: 'Chuyển lịch hẹn sang stylist khác' })
  reassignAppointment(
    @Param('appointmentId') appointmentId: string,
    @Body() reassignAppointmentDto: ReassignAppointmentDto,
    @User() currentUser: any,
  ): Promise<MessageResponse> {
    return this.appointmentsService.reassignAppointment(
      appointmentId,
      currentUser?.id,
      reassignAppointmentDto.newStylistId,
      reassignAppointmentDto.reason,
    );
  }
}
