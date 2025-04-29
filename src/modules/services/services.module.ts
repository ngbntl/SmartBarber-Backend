import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from '../../database/entities/service.entity';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { CloudinaryService } from '../../helpers/cloudinary.helper';

@Module({
  imports: [TypeOrmModule.forFeature([Service])],
  controllers: [ServicesController],
  providers: [ServicesService, CloudinaryService],
  exports: [ServicesService],
})
export class ServicesModule {}
