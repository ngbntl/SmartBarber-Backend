import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeSlot } from '../../database/entities/time-slot.entity';
import { TimeSlotsService } from './time-slots.service';
import { TimeSlotsController } from './time-slots.controller';
import { UsersEntity } from '../../database/entities/users.entity';
import { StylistSchedule } from '../../database/entities/stylist-schedule.entity';
import { StylistTimeOff } from '../../database/entities/stylist-time-off.entity';
import { Appointment } from '../../database/entities/appointment.entity';
import { StylistsService } from '../stylists/stylists.service';
import { PasswordService } from '../../helpers/bcrypt.helper';
import { MailerService } from '../../helpers/mailer.helper';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TimeSlot,
      UsersEntity,
      StylistSchedule,
      StylistTimeOff,
      Appointment,
    ]),
  ],
  controllers: [TimeSlotsController],
  providers: [
    TimeSlotsService,
    StylistsService,
    PasswordService,
    MailerService,
  ],
  exports: [TimeSlotsService],
})
export class TimeSlotsModule {}
