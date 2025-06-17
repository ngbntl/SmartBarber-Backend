import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HairstylesController } from './hairstyles.controller';
import { HairstylesService } from './hairstyles.service';
import { HairstyleEntity } from '../../database/entities/hairstyle.entity';
import { CloudinaryService } from '../../helpers/cloudinary.helper';

@Module({
  imports: [TypeOrmModule.forFeature([HairstyleEntity])],
  controllers: [HairstylesController],
  providers: [HairstylesService, CloudinaryService],
  exports: [HairstylesService],
})
export class HairstylesModule {}
