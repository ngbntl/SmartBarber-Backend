import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StylistsService } from './stylists.service';
import { StylistsController } from './stylists.controller';
import { UsersEntity } from '../../database/entities/users.entity';
import { PasswordService } from 'src/helpers/bcrypt.helper';
import { UsersService } from '../users/users.service';
import { MailerService } from 'src/helpers/mailer.helper';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity])],
  controllers: [StylistsController],
  providers: [StylistsService, PasswordService, UsersService, MailerService],
  exports: [StylistsService],
})
export class StylistsModule {}
