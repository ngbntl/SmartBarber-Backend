import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HaircolorsController } from './haircolors.controller';
import { HaircolorsService } from './haircolors.service';
import { HaircolorEntity } from '../../database/entities/haircolor.entity';
import { CloudinaryService } from '../../helpers/cloudinary.helper';

@Module({
  imports: [TypeOrmModule.forFeature([HaircolorEntity])],
  controllers: [HaircolorsController],
  providers: [HaircolorsService, CloudinaryService],
  exports: [HaircolorsService],
})
export class HaircolorsModule {}
