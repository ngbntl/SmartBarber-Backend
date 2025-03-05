import { Controller, Body, Post } from '@nestjs/common';
import { TokenService } from './token.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateNewAccessTokenDto } from './dto/create-new-access-token.dto';
import { TokenResponse } from './types/token.types';

@ApiTags('Token')
@Controller('/token')
export class TokenController {
  constructor(private tokenService: TokenService) {}

  @Post('access-token')
  async getNewAccessToken(
    @Body() body: CreateNewAccessTokenDto,
  ): Promise<TokenResponse> {
    return await this.tokenService.createNewAccessToken(body.refreshToken);
  }
}
