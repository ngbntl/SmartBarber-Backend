import { Controller, Get, Req, Res } from '@nestjs/common';
import { AuthGoogleService } from './auth-google.service';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { Language } from 'src/common/decorators/language.decorator';

@ApiTags('AuthGoogle')
@Controller('sessions/oauth/google')
export class AuthGoogleController {
  constructor(
    private authService: AuthGoogleService,
    private configService: ConfigService,
  ) {}

  @Get()
  async signIn(
    @Req() req: Request,
    @Res() res: Response,
    @Language() language: string,
  ) {
    const { code, state } = req.query;
    const { redirectUrl } = await this.authService.signIn(
      `${code}`,
      `${state}`,
      language,
      '',
    );
    res.redirect(301, redirectUrl);
  }
}
