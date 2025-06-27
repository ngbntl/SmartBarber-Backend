import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { Appointment } from '../../database/entities/appointment.entity';
import { AppointmentService } from '../../database/entities/appointment-service.entity';
import { TimeSlotTemplate } from '../../database/entities/time-slot-template.entity';
import { BookedTimeSlot } from '../../database/entities/booked-time-slot.entity';
import { Branch } from '../../database/entities/branch.entity';
import { UsersEntity } from '../../database/entities/users.entity';
import { ServicesModule } from '../services/services.module';
import { StylistsModule } from '../stylists/stylists.module';
import { BranchesModule } from '../branches/branches.module';
import { TimeSlotsModule } from '../time-slots/time-slots.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AppointmentSchedulerService } from './appointment-scheduler.service';
import { MailerService } from '../../helpers/mailer.helper';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      AppointmentService,
      TimeSlotTemplate,
      BookedTimeSlot,
      Branch,
      UsersEntity,
    ]),
    ServicesModule,
    StylistsModule,
    BranchesModule,
    TimeSlotsModule,
    NotificationsModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, AppointmentSchedulerService, MailerService],
  exports: [AppointmentsService, AppointmentSchedulerService],
})
export class AppointmentsModule {}
