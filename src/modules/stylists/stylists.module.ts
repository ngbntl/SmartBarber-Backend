import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StylistsService } from './stylists.service';
import { StylistsController } from './stylists.controller';
import { Stylist } from '../../database/entities/stylist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stylist])],
  controllers: [StylistsController],
  providers: [StylistsService],
  exports: [StylistsService],
})
export class StylistsModule {}
