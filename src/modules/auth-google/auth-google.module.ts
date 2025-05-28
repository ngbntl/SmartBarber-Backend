import { Module } from '@nestjs/common';
import { AuthGoogleService } from './auth-google.service';
import { AuthGoogleController } from './auth-google.controller';
import { UsersEntity } from 'src/database/entities/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerService } from 'src/helpers/mailer.helper';
import { PasswordService } from 'src/helpers/bcrypt.helper';
import { TokenModule } from '../tokens/token.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity]), TokenModule, UsersModule],
  providers: [AuthGoogleService, MailerService, PasswordService],
  controllers: [AuthGoogleController],
  exports: [AuthGoogleService],
})
export class AuthGoogleModule {}
