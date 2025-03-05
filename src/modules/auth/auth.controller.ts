import { Controller, Post, Body, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { Language } from 'src/common/decorators/language.decorator';
import { MessageResponse } from 'src/common/types/response';
import { Login } from './types/login.types';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfirmRegisterDto } from './dto/confirm-email.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginRequest: LoginDto): Promise<Login> {
    return await this.authService.login(loginRequest);
  }

  @Post('register')
  async register(
    @Body() registerRequest: RegisterDto,
    @Language() language: string,
  ): Promise<MessageResponse> {
    return await this.authService.register(registerRequest, language);
  }

  @Post('verify-email')
  async verifyEmail(
    @Body() confirmEmail: ConfirmRegisterDto,
  ): Promise<boolean> {
    return await this.authService.verifyEmail(confirmEmail);
  }

  @Post('send-verify-email')
  async sendVerifyEmail(
    @Body() request: SendEmailDto,
    @Language() language: string,
  ): Promise<boolean> {
    return await this.authService.sendVerifyEmail(request, language);
  }

  @Post('forgot-password')
  async sendResetPasswordEmail(
    @Body() request: SendEmailDto,
    @Language() language: string,
  ): Promise<boolean> {
    return await this.authService.sendResetPasswordEmail(request, language);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordRequest: ResetPasswordDto,
  ): Promise<boolean> {
    return await this.authService.resetPassword(resetPasswordRequest);
  }
}
