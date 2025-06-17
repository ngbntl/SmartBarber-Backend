import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HaircolorEntity } from '../../database/entities/haircolor.entity';
import {
  CreateHaircolorDto,
  UpdateHaircolorDto,
  QueryHaircolorDto,
} from './dto/haircolor.dto';
import { CloudinaryService } from '../../helpers/cloudinary.helper';

@Injectable()
export class HaircolorsService {
  constructor(
    @InjectRepository(HaircolorEntity)
    private readonly haircolorRepository: Repository<HaircolorEntity>,
    private readonly cloudinaryHelper: CloudinaryService,
  ) {}

  async findAll(query: QueryHaircolorDto) {
    const { limit = 10, offset = 0 } = query;

    let queryBuilder = this.haircolorRepository.createQueryBuilder('haircolor');

    const [items, total] = await queryBuilder
      .skip(offset)
      .take(limit)
      .orderBy('haircolor.created_at', 'DESC')
      .getManyAndCount();

    return {
      items,
      total,
      offset,
      limit,
    };
  }

  async findOne(id: string) {
    const haircolor = await this.haircolorRepository.findOne({ where: { id } });
    if (!haircolor) {
      throw new NotFoundException('Không tìm thấy màu tóc');
    }
    return haircolor;
  }

  async create(
    createHaircolorDto: CreateHaircolorDto,
    file?: Express.Multer.File,
  ) {
    const haircolor = this.haircolorRepository.create(createHaircolorDto);

    // Upload image if provided
    if (file) {
      const imageUrl = await this.cloudinaryHelper.uploadImage(file);
      haircolor.imageUrl = imageUrl;
    }

    return this.haircolorRepository.save(haircolor);
  }

  async update(
    id: string,
    updateHaircolorDto: UpdateHaircolorDto,
    file?: Express.Multer.File,
  ) {
    const haircolor = await this.findOne(id);

    // Upload new image if provided
    if (file) {
      // Delete old image if exists
      if (haircolor.imageUrl) {
        const publicId = this.cloudinaryHelper.extractPublicIdFromUrl(
          haircolor.imageUrl,
        );
        await this.cloudinaryHelper.deleteImage(publicId);
      }

      const imageUrl = await this.cloudinaryHelper.uploadImage(file);
      updateHaircolorDto.imageUrl = imageUrl;
    }

    // Update haircolor
    Object.assign(haircolor, updateHaircolorDto);

    return this.haircolorRepository.save(haircolor);
  }

  async remove(id: string) {
    const haircolor = await this.findOne(id);

    // Delete image from cloudinary
    if (haircolor.imageUrl) {
      const publicId = this.cloudinaryHelper.extractPublicIdFromUrl(
        haircolor.imageUrl,
      );
      await this.cloudinaryHelper.deleteImage(publicId);
    }

    return this.haircolorRepository.remove(haircolor);
  }
}
