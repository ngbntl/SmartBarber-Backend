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
import { RedisModule } from './modules/redis/redis.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { ServicesModule } from './modules/services/services.module';
import { StylistsModule } from './modules/stylists/stylists.module';
import { BranchesModule } from './modules/branches/branches.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { TimeSlotsModule } from './modules/time-slots/time-slots.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { HaircolorsModule } from './modules/haircolors/haircolors.module';
import { HairstylesModule } from './modules/hairstyles/hairstyles.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

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
    RedisModule,
    AppointmentsModule,
    ServicesModule,
    StylistsModule,
    BranchesModule,
    PromotionsModule,
    TimeSlotsModule,
    ReviewsModule,
    HaircolorsModule,
    HairstylesModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [JwtService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LanguageMiddleware).forRoutes('*');
  }
}
