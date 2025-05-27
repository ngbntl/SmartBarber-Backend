import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StylistsService } from './stylists.service';
import { StylistsController } from './stylists.controller';
import { UsersEntity } from '../../database/entities/users.entity';
import { PasswordService } from 'src/helpers/bcrypt.helper';
import { MailerService } from 'src/helpers/mailer.helper';
import { StylistSchedule } from '../../database/entities/stylist-schedule.entity';
import { StylistTimeOff } from '../../database/entities/stylist-time-off.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersEntity, StylistSchedule, StylistTimeOff]),
    UsersModule,
  ],
  controllers: [StylistsController],
  providers: [StylistsService, PasswordService, MailerService],
  exports: [StylistsService],
})
export class StylistsModule {}
