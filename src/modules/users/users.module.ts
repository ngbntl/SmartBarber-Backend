import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from 'src/database/entities/users.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PasswordService } from 'src/helpers/bcrypt.helper';
import { MailerService } from 'src/helpers/mailer.helper';
import { CloudinaryService } from 'src/helpers/cloudinary.helper';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity])],
  providers: [UsersService, PasswordService, MailerService, CloudinaryService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
