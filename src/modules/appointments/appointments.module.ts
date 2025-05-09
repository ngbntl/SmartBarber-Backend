import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { Appointment } from '../../database/entities/appointment.entity';
import { TimeSlot } from '../../database/entities/time-slot.entity';
import { Branch } from '../../database/entities/branch.entity';
import { UsersEntity } from '../../database/entities/users.entity';
import { ServicesModule } from '../services/services.module';
import { StylistsService } from '../stylists/stylists.service';
import { BranchesService } from '../branches/branches.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, TimeSlot, Branch, UsersEntity]),
    ServicesModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, StylistsService, BranchesService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
