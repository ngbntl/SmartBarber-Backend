import {
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../../database/entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { generateCustomString } from 'src/utils/function';
import { MessageResponse } from 'src/common/types/response';
import { CloudinaryService } from '../../helpers/cloudinary.helper';
import { Services, ServicesResponse } from './types/services.types';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    private cloudinaryService: CloudinaryService,
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

  async createServiceWithImage(
    createServiceDto: CreateServiceDto,
    file: Express.Multer.File,
  ): Promise<MessageResponse> {
    try {
      const imageUrl = await this.cloudinaryService.uploadImage(
        file,
        'services',
      );

      const serviceId = generateCustomString(8);
      const service = this.serviceRepository.create({
        id: serviceId,
        ...createServiceDto,
        image: imageUrl,
      });

      await this.serviceRepository.save(service);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Tạo dịch vụ với ảnh thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async uploadServiceImage(
    id: string,
    file: Express.Multer.File,
  ): Promise<MessageResponse> {
    try {
      const service = await this.serviceRepository.findOne({ where: { id } });

      if (!service) {
        throw new NotFoundException('Dịch vụ không tồn tại');
      }

      if (service.image) {
        try {
          const publicId = this.cloudinaryService.extractPublicIdFromUrl(
            service.image,
          );
          await this.cloudinaryService.deleteImage(publicId);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }

      const imageUrl = await this.cloudinaryService.uploadImage(
        file,
        'services',
      );

      service.image = imageUrl;
      await this.serviceRepository.save(service);

      return {
        statusCode: HttpStatus.OK,
        message: 'Tải lên ảnh dịch vụ thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async getAllServices(): Promise<Services> {
    try {
      const [services, total] = await this.serviceRepository.findAndCount({
        where: { isActive: true },
      });

      const items = plainToInstance(ServicesResponse, services, {
        excludeExtraneousValues: true,
      });

      return { items, total };
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
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

  async updateService(
    id: string,
    updateServiceDto: CreateServiceDto,
  ): Promise<MessageResponse> {
    try {
      const service = await this.serviceRepository.findOne({ where: { id } });
      if (!service) {
        throw new NotFoundException('Dịch vụ không tồn tại');
      }

      Object.assign(service, updateServiceDto);
      await this.serviceRepository.save(service);

      return {
        statusCode: HttpStatus.OK,
        message: 'Cập nhật dịch vụ thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteService(id: string): Promise<MessageResponse> {
    try {
      const service = await this.serviceRepository.findOne({ where: { id } });
      if (!service) {
        throw new NotFoundException('Dịch vụ không tồn tại');
      }
      service.isActive = false;
      await this.serviceRepository.save(service);
      return {
        statusCode: HttpStatus.OK,
        message: 'Xóa dịch vụ thành công',
      };
    } catch (error) {
      throw error;
    }
  }
}
