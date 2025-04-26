import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../../database/entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { generateCustomString } from 'src/utils/function';
import { MessageResponse } from 'src/common/types/response';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  async createService(
    createServiceDto: CreateServiceDto,
  ): Promise<MessageResponse> {
    try {
      const serviceId = generateCustomString(8);
      const service = this.serviceRepository.create({
        id: serviceId,
        ...createServiceDto,
      });

      await this.serviceRepository.save(service);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Tạo dịch vụ thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async getAllServices(): Promise<Service[]> {
    return await this.serviceRepository.find({ where: { isActive: true } });
  }

  async getServiceById(id: string): Promise<Service> {
    try {
      const service = await this.serviceRepository.findOne({
        where: { id, isActive: true },
      });
      if (!service) {
        throw new NotFoundException('Dịch vụ không tồn tại');
      }
      return service;
    } catch (error) {
      throw error;
    }
  }
}
