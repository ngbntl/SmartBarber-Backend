import axios from 'axios';
import { GoogleOauthToken } from './types/googleOauthToken';
import { GoogleUserResult } from './types/googleUserResult';
import { TokenService } from 'src/modules/tokens/token.service';
import { PasswordService } from 'src/helpers/bcrypt.helper';
import { MailerService } from 'src/helpers/mailer.helper';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CONFIRM_REGISTER_GOOGLE, MESSAGE } from 'src/common/constants/message';
import { UsersService } from '../users/users.service';
import { generateCustomString, generateUserId } from 'src/utils/function';
import {
  RoleType,
  notifyPropsObj,
  timeZoneObj,
} from 'src/common/constants/enum';

@Injectable()
export class AuthGoogleService {
  constructor(
    private usersService: UsersService,
    private tokenService: TokenService,
    private configService: ConfigService,
    private passwordService: PasswordService,
    private mailService: MailerService,
  ) {}

  async getGoogleUser({
    id_token,
    access_token,
  }: {
    id_token: string;
    access_token: string;
  }): Promise<GoogleUserResult> {
    try {
      const { data } = await axios.get<GoogleUserResult>(
        `${this.configService.get<string>(
          'oauth.google_url_access_token',
        )}${access_token}`,
        {
          headers: {
            Authorization: `Bearer ${id_token}`,
          },
        },
      );
      return data;
    } catch (err: any) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: MESSAGE.GOOGLE_USER_FAILED,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getGoogleOauthToken({
    code,
  }: {
    code: string;
  }): Promise<GoogleOauthToken> {
    const options = {
      code,
      client_id: this.configService.get<string>('oauth.google_client_id'),
      client_secret: this.configService.get<string>(
        'oauth.google_client_secret',
      ),
      redirect_uri: `${this.configService.get<string>(
        'app.server_url',
      )}/api/sessions/oauth/google`,
      grant_type: 'authorization_code',
    };
    try {
      const { data } = await axios.post<GoogleOauthToken>(
        this.configService.get<string>('oauth.google_url_token'),
        new URLSearchParams(options),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return data;
    } catch (err: any) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: MESSAGE.GOOGLE_OAUTH_FAILED,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async signIn(
    codeGoogle: string,
    state: string,
    language: string,
    rootFolderId: string, // This parameter is kept for backwards compatibility
  ): Promise<any> {
    try {
      let googleUser;
      if (!codeGoogle) {
        throw new HttpException(MESSAGE.BAD_REQUEST, HttpStatus.BAD_REQUEST);
      }
      const { id_token, access_token } = await this.getGoogleOauthToken({
        code: codeGoogle,
      });

      const { verified_email, email, family_name, given_name } =
        await this.getGoogleUser({
          id_token,
          access_token,
        });

      if (!verified_email) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            message: MESSAGE.GOOGLE_VERIFIED_FAILED,
          },
          HttpStatus.FORBIDDEN,
        );
      }
      const user = await this.usersService.findByEmail(email);

      if (!user) {
        const passwordUser = generateCustomString(12);
        const hashedPassword =
          this.passwordService.encryptPassword(passwordUser);
        const userId = generateUserId().toLocaleLowerCase();

        const mappedData: any = {
          id: userId,
          createAt: new Date().getTime(),
          updateAt: new Date().getTime(),
          deleteAt: 0,
          username: email.substring(0, email.indexOf('@')),
          password: hashedPassword,
          authService: '',
          email,
          emailVerified: 1,
          nickname: '',
          firstName: given_name,
          lastName: family_name,
          roles: RoleType.USER,
          allowMarketing: 0,
          props: {},
          notifyProps: notifyPropsObj,
          lastPasswordUpdate: new Date().getTime(),
          lastPictureUpdate: 0,
          failedAttempts: 0,
          locale: 'en',
          mfaActive: 0,
          mfaSecret: '',
          position: '',
          timezone: timeZoneObj,
        };

        googleUser = await this.usersService.save(mappedData);
        if (!googleUser) {
          throw new HttpException(MESSAGE.BAD_REQUEST, HttpStatus.BAD_REQUEST);
        }
        const { titles, content } = CONFIRM_REGISTER_GOOGLE(
          language,
          email,
          googleUser.firstName + ' ' + googleUser.lastName,
        );

        await this.mailService.sendMail(googleUser.email, titles, content);
      } else if (!user.emailVerified) {
        const redirectUrl = `${this.configService.get<string>(
          'app.client_url',
        )}/login?isLoginByGoogle=false`;
        return {
          redirectUrl,
        };
      } else {
        googleUser = user;
      }

      const payload = { userId: googleUser.id, email: googleUser.email };

      const { accessToken, refreshToken } = await this.tokenService.createOne(
        payload,
      );
      const destination = `?ac=${accessToken}&rf=${refreshToken}`;

      const redirectUrl = `${this.configService.get<string>(
        'app.client_url',
      )}/login-success${destination}`;

      return {
        redirectUrl,
      };
    } catch (err: any) {
      console.error(err);

      return `${this.configService.get<string>(
        'app.client_url',
      )}/login?oauth=false`;
    }
  }
}
