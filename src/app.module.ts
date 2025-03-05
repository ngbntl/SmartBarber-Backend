import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtService } from '@nestjs/jwt';

import {
  type,
  host,
  port,
  username,
  password,
  database,
  entities,
  synchronize,
  migrations,
} from './common/config/ormconfig';
import configuration from './common/config/configuration';

import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { TokenModule } from './modules/tokens/token.module';
import { LanguageMiddleware } from './middlewares/language.middleware';
import { ClientModule } from './modules/client/client.module';
import { RedisModule } from './modules/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, ScheduleModule.forRoot()],
      useFactory: () => ({
        type,
        host,
        port,
        username,
        password,
        database,
        entities,
        synchronize,
        migrations,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    TokenModule,
    ClientModule,
    RedisModule,
  ],
  controllers: [],
  providers: [JwtService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LanguageMiddleware).forRoutes('*');
  }
}
