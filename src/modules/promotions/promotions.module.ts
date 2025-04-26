import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';
import { Promotion } from '../../database/entities/promotion.entity';
import { Service } from '../../database/entities/service.entity';
import { Notification } from '../../database/entities/notification.entity';
import { UsersEntity } from '../../database/entities/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Promotion, Service, Notification, UsersEntity]),
  ],
  controllers: [PromotionsController],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
