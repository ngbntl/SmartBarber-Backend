import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StylistsService } from './stylists.service';
import { StylistsController } from './stylists.controller';
import { UsersEntity } from '../../database/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity])],
  controllers: [StylistsController],
  providers: [StylistsService],
  exports: [StylistsService],
})
export class StylistsModule {}
