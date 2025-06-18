import {
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { TokenService } from '../tokens/token.service';
import { MailerService } from 'src/helpers/mailer.helper';
import { ConfigService } from '@nestjs/config';
import {
  notifyPropsObj,
  timeZoneObj,
  RoleType,
} from 'src/common/constants/enum';
import {
  CONFIRM_REGISTER,
  RESET_PASSWORD,
  MESSAGE,
} from 'src/common/constants/message';
import { PasswordService } from 'src/helpers/bcrypt.helper';
import { generateRandomNumber, generateUserId } from 'src/utils/function';
import { MessageResponse } from 'src/common/types/response';
import { Login } from './types/login.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RedisService } from '../redis/redis.service';
import { ConfirmRegisterDto } from './dto/confirm-email.dto';
@Injectable()
export class AuthService {
  constructor(
    private tokenService: TokenService,
    private usersService: UsersService,
    private configService: ConfigService,
    private mailService: MailerService,
    private passwordService: PasswordService,
    private redisService: RedisService,
  ) {}

  async login(request: LoginDto): Promise<Login> {
    const user = await this.usersService.findByEmail(
      request.email?.toLocaleLowerCase(),
    );
    try {
      if (!user) {
        throw new NotFoundException(MESSAGE.ACCOUNT_LOGIN_FAILED);
      }

      if (user) {
        if (user.emailVerified === 0) {
          throw new NotFoundException(MESSAGE.ACCOUNT_LOGIN_FAILED);
        }
      }

      if (
        !this.passwordService.comparePassword(request.password, user.password)
      ) {
        throw new UnauthorizedException(MESSAGE.ACCOUNT_LOGIN_FAILED);
      }

      const payload = {
        userId: user.id,
        email: user.email,
      };

      const { accessToken, refreshToken } = await this.tokenService.createOne(
        payload,
        false,
      );

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  async register(
    request: RegisterDto,
    language: string,
  ): Promise<MessageResponse> {
    try {
      const email = request.email.toLowerCase();
      let user = await this.usersService.findByEmail(email);
      if (user) {
        throw new BadRequestException(MESSAGE.EMAIL_EXISTED);
      }
      const hashedPassword = this.passwordService.encryptPassword(
        request.password,
      );

      const userId = generateUserId();
      const otpCode = generateRandomNumber(100000, 999999).toString();

      await this.redisService.setOtp(email, otpCode, 300);

      await this.usersService.save({
        id: userId,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
        deletedAt: 0,
        username: email.substring(0, email.indexOf('@')),
        password: hashedPassword,
        email,
        emailVerified: 0,
        firstName: request.firstName,
        lastName: request.lastName,
        roleType: RoleType.USER,
        lastPasswordUpdate: new Date().getTime(),
        lastPictureUpdate: 0,
        failedAttempts: 0,
        locale: 'en',
        position: '',
        timezone: timeZoneObj,
      });

      const fullName =
        language == 'en'
          ? `${request.firstName} ${request.lastName}`
          : `${request.lastName} ${request.firstName}`;

      const html = CONFIRM_REGISTER('vi', fullName, otpCode);

      this.mailService.sendMail(email, html.titles, html.content);

      return {
        statusCode: HttpStatus.OK,
        message: MESSAGE.ACCOUNT_REGISTER_SUCCESS,
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail(confirmEmail: ConfirmRegisterDto): Promise<boolean> {
    try {
      const storedOtp = await this.redisService.getOtp(confirmEmail.email);
      if (!storedOtp) {
        throw new BadRequestException(MESSAGE.INVALID_OR_EXPIRED_OTP);
      }

      if (storedOtp.otp !== confirmEmail.otpCode) {
        throw new BadRequestException(MESSAGE.OTP_INCORRECT);
      }

      const user = await this.usersService.findByEmail(confirmEmail.email);
      if (!user) {
        throw new NotFoundException(MESSAGE.ACCOUNT_NOT_EXISTED);
      }

      if (user.emailVerified === 1) {
        await this.redisService.deleteOtp(confirmEmail.email);
        throw new BadRequestException(MESSAGE.ACCOUNT_CONFIRMED);
      }

      user.emailVerified = 1;
      user.updatedAt = new Date().getTime();

      const result = await this.usersService.save(user);
      if (!result) {
        throw new BadRequestException(MESSAGE.ACCOUNT_VERIFY_FAILED);
      }

      await this.redisService.deleteOtp(confirmEmail.email);
      return true;
    } catch (error) {
      Logger.error(`Error verifying email: ${error.message}`);
      throw error;
    }
  }

  async sendVerifyEmail(
    request: SendEmailDto,
    language: string,
  ): Promise<boolean> {
    try {
      const { email } = request;
      const user = await this.usersService.findByEmail(email);

      if (!user) {
        throw new NotFoundException(MESSAGE.ACCOUNT_NOT_EXISTED);
      }

      if (user.emailVerified) {
        throw new BadRequestException(MESSAGE.ACCOUNT_CONFIRMED);
      }

      const otpCode = generateRandomNumber(100000, 999999).toString();

      await this.redisService.setOtp(email, otpCode, 300);

      const fullName = `${user.firstName} ${user.lastName}`;

      const html = CONFIRM_REGISTER('vi', fullName, otpCode);

      await this.mailService.sendMail(user.email, html.titles, html.content);

      return true;
    } catch (error) {
      throw error;
    }
  }

  async sendResetPasswordEmail(
    request: SendEmailDto,
    language: string,
  ): Promise<boolean> {
    try {
      const { email } = request;
      const user = await this.usersService.findByEmail(email);

      if (!user) {
        throw new BadRequestException(MESSAGE.EMAIL_NOT_EXIST);
      }

      if (!user.emailVerified) {
        throw new BadRequestException(MESSAGE.ACCOUNT_NOT_ACTIVATED);
      }

      const otpCode = generateRandomNumber(100000, 999999).toString();

      const fullName = `${user.firstName} ${user.lastName}`;

      const html = RESET_PASSWORD('vi', fullName, otpCode);

      await this.mailService.sendMail(user.email, html.titles, html.content);

      return true;
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(request: ResetPasswordDto): Promise<boolean> {
    try {
      const { password, token } = request;
      const tokenData = await this.tokenService.validateToken(token);

      if (!tokenData) {
        throw new UnauthorizedException(MESSAGE.INVALID_OR_EXPIRED_TOKEN);
      }

      const user = await this.usersService.findByEmail(tokenData.email);

      if (!user) {
        throw new NotFoundException(MESSAGE.ACCOUNT_NOT_EXISTED);
      }

      if (!user.emailVerified) {
        throw new BadRequestException(MESSAGE.ACCOUNT_NOT_ACTIVATED);
      }

      const hashedPassword = this.passwordService.encryptPassword(password);
      user.password = hashedPassword;
      user.lastPasswordUpdate = new Date().getTime();
      const result = await this.usersService.save(user);

      if (!result) {
        throw new BadRequestException(MESSAGE.ACCOUNT_CHANGE_PASSWORD_SUCCESS);
      }

      this.tokenService.delete(tokenData.tokenId);

      return true;
    } catch (error) {
      throw error;
    }
  }
}
