import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '../../database/entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { MessageResponse } from 'src/common/types/response';
import { Branches, BranchesResponse } from './types/branches.types';
import { plainToClass, plainToInstance } from 'class-transformer';
import { CloudinaryService } from '../../helpers/cloudinary.helper';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createBranchDto: CreateBranchDto): Promise<MessageResponse> {
    try {
      const branch = this.branchRepository.create(createBranchDto);
      await this.branchRepository.save(branch);
      return {
        message: 'Tạo chi nhánh thành công',
        statusCode: HttpStatus.CREATED,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll(): Promise<Branches> {
    try {
      const [branches, total] = await this.branchRepository.findAndCount({
        order: { city: 'ASC', district: 'ASC', name: 'ASC' },
      });

      const items = plainToInstance(BranchesResponse, branches, {
        excludeExtraneousValues: true,
      });

      return {
        items,
        total,
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string): Promise<BranchesResponse> {
    try {
      const branch = await this.branchRepository.findOne({ where: { id } });
      if (!branch) {
        throw new NotFoundException(`Chi nhánh với ID ${id} không tồn tại`);
      }

      return plainToClass(BranchesResponse, branch, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw error;
    }
  }

  async uploadImage(
    id: string,
    file: Express.Multer.File,
  ): Promise<MessageResponse> {
    try {
      const branch = await this.branchRepository.findOne({ where: { id } });
      if (!branch) {
        throw new NotFoundException(`Chi nhánh với ID ${id} không tồn tại`);
      }

      const result = await this.cloudinaryService.uploadImage(
        file,
        'smartbarber/branches',
      );

      if (branch.image) {
        try {
          const publicId = this.cloudinaryService.extractPublicIdFromUrl(
            branch.image,
          );
          if (publicId) {
            await this.cloudinaryService.deleteImage(publicId);
          }
        } catch (error) {
          console.error('Failed to delete old branch image:', error);
        }
      }

      branch.image = result;
      await this.branchRepository.save(branch);

      return {
        message: 'Upload ảnh chi nhánh thành công',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteImage(id: string): Promise<MessageResponse> {
    try {
      const branch = await this.branchRepository.findOne({ where: { id } });
      if (!branch) {
        throw new NotFoundException(`Chi nhánh với ID ${id} không tồn tại`);
      }

      if (!branch.image) {
        return {
          message: 'Chi nhánh này không có ảnh để xóa',
          statusCode: HttpStatus.BAD_REQUEST,
        };
      }

      try {
        const publicId = this.cloudinaryService.extractPublicIdFromUrl(
          branch.image,
        );
        if (publicId) {
          await this.cloudinaryService.deleteImage(publicId);
        }
      } catch (error) {
        console.error('Failed to delete branch image from Cloudinary:', error);
      }

      branch.image = null;
      await this.branchRepository.save(branch);

      return {
        message: 'Xóa ảnh chi nhánh thành công',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: string,
    updateBranchDto: CreateBranchDto,
  ): Promise<MessageResponse> {
    try {
      const branch = await this.branchRepository.findOne({ where: { id } });
      if (!branch) {
        throw new NotFoundException(`Chi nhánh với ID ${id} không tồn tại`);
      }

      Object.assign(branch, updateBranchDto);
      await this.branchRepository.save(branch);

      return {
        message: 'Cập nhật chi nhánh thành công',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }
}
