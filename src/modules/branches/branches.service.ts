import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '../../database/entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { MessageResponse } from 'src/common/types/response';
import { Branches, BranchesResponse } from './types/branches.types';
import { plainToClass, plainToInstance } from 'class-transformer';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
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
        where: { isActive: true },
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
}
