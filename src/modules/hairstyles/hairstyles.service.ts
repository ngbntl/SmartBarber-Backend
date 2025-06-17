import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HairstyleEntity } from '../../database/entities/hairstyle.entity';
import {
  CreateHairstyleDto,
  UpdateHairstyleDto,
  QueryHairstyleDto,
} from './dto/hairstyle.dto';
import { CloudinaryService } from '../../helpers/cloudinary.helper';

@Injectable()
export class HairstylesService {
  constructor(
    @InjectRepository(HairstyleEntity)
    private readonly hairstyleRepository: Repository<HairstyleEntity>,
    private readonly cloudinaryHelper: CloudinaryService,
  ) {}

  async findAll(query: QueryHairstyleDto) {
    const { limit = 10, offset = 0 } = query;

    let queryBuilder = this.hairstyleRepository.createQueryBuilder('hairstyle');

    const [items, total] = await queryBuilder
      .skip(offset)
      .take(limit)
      .orderBy('hairstyle.created_at', 'DESC')
      .getManyAndCount();

    return {
      items,
      total,
      offset,
      limit,
    };
  }

  async findOne(id: string) {
    const hairstyle = await this.hairstyleRepository.findOne({ where: { id } });
    if (!hairstyle) {
      throw new NotFoundException('Không tìm thấy kiểu tóc');
    }
    return hairstyle;
  }

  async create(
    createHairstyleDto: CreateHairstyleDto,
    file?: Express.Multer.File,
  ) {
    const hairstyle = this.hairstyleRepository.create(createHairstyleDto);

    // Upload image if provided
    if (file) {
      const imageUrl = await this.cloudinaryHelper.uploadImage(file);
      hairstyle.imageUrl = imageUrl;
    }

    return this.hairstyleRepository.save(hairstyle);
  }

  async update(
    id: string,
    updateHairstyleDto: UpdateHairstyleDto,
    file?: Express.Multer.File,
  ) {
    const hairstyle = await this.findOne(id);

    // Upload new image if provided
    if (file) {
      // Delete old image if exists
      if (hairstyle.imageUrl) {
        const publicId = this.cloudinaryHelper.extractPublicIdFromUrl(
          hairstyle.imageUrl,
        );
        await this.cloudinaryHelper.deleteImage(publicId);
      }

      const imageUrl = await this.cloudinaryHelper.uploadImage(file);
      updateHairstyleDto.imageUrl = imageUrl;
    }

    // Update hairstyle
    Object.assign(hairstyle, updateHairstyleDto);

    return this.hairstyleRepository.save(hairstyle);
  }

  async remove(id: string) {
    const hairstyle = await this.findOne(id);

    // Delete image from cloudinary
    if (hairstyle.imageUrl) {
      const publicId = this.cloudinaryHelper.extractPublicIdFromUrl(
        hairstyle.imageUrl,
      );
      await this.cloudinaryHelper.deleteImage(publicId);
    }

    return this.hairstyleRepository.remove(hairstyle);
  }
}
