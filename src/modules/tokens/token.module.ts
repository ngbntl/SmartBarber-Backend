import { Module, Global } from '@nestjs/common';
import { TokenService } from './token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { TokenController } from './token.controller';
import { TokensEntity } from 'src/database/entities/tokens.entity';

@Global()
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([TokensEntity])],
  providers: [TokenService, JwtService],
  controllers: [TokenController],
  exports: [TokenService],
})
export class TokenModule {}
