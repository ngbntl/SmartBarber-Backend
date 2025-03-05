import {
  UnprocessableEntityException,
  BadRequestException,
  UnauthorizedException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, LessThan, Repository } from 'typeorm';
import { TokensEntity } from 'src/database/entities/tokens.entity';
import { generateKeyOfToken } from 'src/helpers/crypto.helper';
import { TokenPayloadDto } from './dto/token-payload.dto';
import { MESSAGE } from 'src/common/constants/message';
import { TokenResponse } from './types/token.types';
import { Cron } from '@nestjs/schedule';
import { TokenData } from './types/token-data.types';

@Injectable()
export class TokenService {
  public publicKey: string;

  private expiredAccessToken = '1d';
  private expiredRefreshToken = '30d';
  private expiredVerifyToken = '15m';

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(TokensEntity)
    private readonly tokenRes: Repository<TokensEntity>,
  ) {}

  async getOne(id: string): Promise<TokensEntity> {
    const token = await this.tokenRes.findOne({ where: { id } });
    return token;
  }

  async delete(id: string) {
    return await this.tokenRes.delete({ id });
  }

  async save(token: DeepPartial<TokensEntity>): Promise<TokensEntity> {
    return await this.tokenRes.save(token);
  }

  generateToken(payload: any, key: string, expiresIn: string) {
    const options: jwt.SignOptions = {
      expiresIn: expiresIn,
      algorithm: 'RS256',
      allowInsecureKeySizes: true,
    };

    const token = jwt.sign(payload, key, options);

    return token;
  }

  async createOne(
    payload: TokenPayloadDto,
    isVerifyToken: boolean = false,
  ): Promise<TokenResponse> {
    const { publicKey: accessPublicKey, privateKey: accessPrivateKey }: any =
      await generateKeyOfToken();
    const { publicKey: refreshPublicKey, privateKey: refreshPrivateKey }: any =
      await generateKeyOfToken();

    const currentDate = new Date();

    const expireAt = new Date();
    if (isVerifyToken) {
      expireAt.setMinutes(15);
    } else {
      expireAt.setMonth(
        currentDate.getMonth() === 12 ? 1 : currentDate.getMonth() + 1,
      );
    }

    const dataToken = {
      refreshToken: '',
      userId: payload.userId,
      accessPublicKey,
      refreshPublicKey,
      expireAt,
      createAt: new Date().getTime()
    };

    const token = await this.save(dataToken);
    const payloadFormat = JSON.stringify({ ...payload, tokenId: token.id });

    const accessToken = this.generateToken(
      JSON.parse(payloadFormat),
      accessPrivateKey,
      isVerifyToken ? this.expiredVerifyToken : this.expiredAccessToken,
    );

    const refreshToken = this.generateToken(
      JSON.parse(payloadFormat),
      refreshPrivateKey,
      isVerifyToken ? this.expiredVerifyToken : this.expiredRefreshToken,
    );

    token.refreshToken = refreshToken;

    await this.save(token);

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateToken(accessToken: any): Promise<TokenData> {
    try {
      if (!accessToken) {
        return null;
      }
      const payload = this.jwtService.decode(accessToken);

      const { tokenId } = payload;
      const tokenDb = await this.getOne(tokenId);

      if (!tokenDb) {
        throw new UnprocessableEntityException(
          MESSAGE.INVALID_OR_EXPIRED_TOKEN,
        );
      }

      const publicKey = tokenDb.accessPublicKey;

      jwt.verify(accessToken, publicKey, (err, decode) => {
        if (err) {
          throw new UnauthorizedException(MESSAGE.INVALID_OR_EXPIRED_TOKEN);
        }
      });

      return payload;
    } catch (error) {
      return null;
    }
  }

  async createNewAccessToken(token: string): Promise<TokenResponse> {
    try {
      const decodeTokenData: any = this.jwtService.decode(token);
      if (!decodeTokenData) {
        throw new BadRequestException(MESSAGE.INVALID_OR_EXPIRED_TOKEN);
      }
      const { tokenId, email } = decodeTokenData;
      const tokenDb = await this.getOne(tokenId);

      if (!tokenDb) {
        throw new UnprocessableEntityException(
          MESSAGE.INVALID_OR_EXPIRED_TOKEN,
        );
      }

      const { refreshToken, refreshPublicKey, userId , updateAt} = tokenDb;

      jwt.verify(refreshToken, refreshPublicKey, (err, decode) => {
        if (err) {
          this.delete(tokenId);
          throw new UnprocessableEntityException(
            MESSAGE.INVALID_OR_EXPIRED_TOKEN,
          );
        }
      });

      const { publicKey: accessPublicKey, privateKey: accessPrivateKey }: any =
        await generateKeyOfToken();

      const payload = {
        userId: userId,
        email: email,
      };

      const payloadFormat = JSON.stringify({ ...payload, tokenId });

      const accessToken = this.generateToken(
        JSON.parse(payloadFormat),
        accessPrivateKey,
        this.expiredAccessToken,
      );

      tokenDb.accessPublicKey = accessPublicKey;
      tokenDb.updateAt = new Date().getTime()
      await this.save(tokenDb);

      return {
        accessToken,
      };
    } catch (err) {
      throw err;
    }
  }

  @Cron('00 00 * * *')
  async jobDeleteTokens() {
    const currentDate = new Date();
    const oneMonthAgo = new Date(currentDate);
    let targetMonth = oneMonthAgo.getMonth() - 3;
    if (targetMonth < 0) {
      oneMonthAgo.setFullYear(oneMonthAgo.getFullYear() - 1);
      targetMonth += 12;
    }
    oneMonthAgo.setMonth(targetMonth);

    const batchSize = 200;
    let offset = 0;

    try {
      const totalRecord = await this.tokenRes.count({
        where: {
          expireAt: LessThan(oneMonthAgo),
        },
      });

      while (offset < totalRecord) {
        const expiredTokens = await this.tokenRes.find({
          where: {
            expireAt: LessThan(oneMonthAgo),
          },
          take: batchSize,
          skip: 0,
        });

        if (expiredTokens.length === 0) {
          break;
        }

        await this.tokenRes.remove(expiredTokens);

        offset += expiredTokens.length;

        console.log(`${offset} token have been deleted.`);
      }

      console.log(`Delete tokens success`);
    } catch (error) {
      throw error;
    }
  }
}
