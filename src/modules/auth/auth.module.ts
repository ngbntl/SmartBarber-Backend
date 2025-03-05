import { Module, Global } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailerService } from 'src/helpers/mailer.helper';
import { PasswordService } from 'src/helpers/bcrypt.helper';

@Global()
@Module({
  imports: [],
  providers: [AuthService, MailerService, PasswordService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
