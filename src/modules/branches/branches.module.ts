import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';
import { Branch } from '../../database/entities/branch.entity';
import { CloudinaryService } from '../../helpers/cloudinary.helper';

@Module({
  imports: [TypeOrmModule.forFeature([Branch])],
  controllers: [BranchesController],
  providers: [BranchesService, CloudinaryService],
  exports: [BranchesService],
})
export class BranchesModule {}
