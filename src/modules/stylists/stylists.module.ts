import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StylistsService } from './stylists.service';
import { StylistsController } from './stylists.controller';
import { UsersEntity } from '../../database/entities/users.entity';
import { PasswordService } from 'src/helpers/bcrypt.helper';
import { UsersService } from '../users/users.service';
import { MailerService } from 'src/helpers/mailer.helper';
import { StylistSchedule } from '../../database/entities/stylist-schedule.entity';
import { StylistTimeOff } from '../../database/entities/stylist-time-off.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity, StylistSchedule, StylistTimeOff])],
  controllers: [StylistsController],
  providers: [StylistsService, PasswordService, UsersService, MailerService],
  exports: [StylistsService],
})
export class StylistsModule {}
