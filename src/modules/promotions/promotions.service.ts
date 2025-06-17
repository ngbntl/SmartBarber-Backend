import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { Promotion } from '../../database/entities/promotion.entity';
import { Service } from '../../database/entities/service.entity';
import { UsersEntity } from '../../database/entities/users.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { generateUUID } from 'src/utils/function';
import { MessageResponse } from 'src/common/types/response';
import { Promotions, PromotionsResponse } from './types/promotions.type';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(UsersEntity)
    private userRepository: Repository<UsersEntity>,
  ) {}

  async create(
    createPromotionDto: CreatePromotionDto,
  ): Promise<MessageResponse> {
    try {
      const {
        name,
        code,
        applicableServiceIds,
        isPercentage,
        discountAmount,
        discountPercent,
      } = createPromotionDto;

      // Kiểm tra dữ liệu đầu vào
      if (isPercentage && !discountPercent) {
        throw new BadRequestException(
          'Phần trăm giảm giá là bắt buộc khi sử dụng isPercentage=true',
        );
      }

      if (!isPercentage && !discountAmount) {
        throw new BadRequestException(
          'Số tiền giảm giá là bắt buộc khi sử dụng isPercentage=false',
        );
      }

      // Kiểm tra nếu mã code đã tồn tại
      if (code) {
        const existingPromotion = await this.promotionRepository.findOne({
          where: { code },
        });
        if (existingPromotion) {
          throw new ConflictException(`Mã khuyến mãi ${code} đã tồn tại`);
        }
      }

      // Kiểm tra các dịch vụ có tồn tại không
      if (applicableServiceIds && applicableServiceIds.length > 0) {
        const services = await this.serviceRepository.find({
          where: { id: In(applicableServiceIds) },
        });

        if (services.length !== applicableServiceIds.length) {
          throw new NotFoundException('Một hoặc nhiều dịch vụ không tồn tại');
        }
      }

      // Tạo khuyến mãi mới
      const promotion = this.promotionRepository.create({
        id: generateUUID(),
        ...createPromotionDto,
      });

      const savedPromotion = await this.promotionRepository.save(promotion);

      // Thêm các dịch vụ liên quan nếu có
      if (applicableServiceIds && applicableServiceIds.length > 0) {
        const services = await this.serviceRepository.findByIds(
          applicableServiceIds,
        );
        promotion.applicableServices = services;
        await this.promotionRepository.save(promotion);
      }

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Khuyến mãi đã được tạo thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll(activeOnly: boolean = false): Promise<Promotions> {
    try {
      const query: any = {};

      if (activeOnly) {
        const now = new Date();
        query.isActive = true;
        query.startDate = LessThanOrEqual(now);
        query.endDate = MoreThanOrEqual(now);
      }

      const [promotions, total] = await this.promotionRepository.findAndCount({
        where: query,
        relations: ['applicableServices'],
        order: {
          startDate: 'DESC',
        },
      });

      const items = plainToInstance(PromotionsResponse, promotions, {
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

  async findOne(id: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { id },
      relations: ['applicableServices'],
    });
    if (!promotion) {
      throw new NotFoundException(`Khuyến mãi với ID ${id} không tồn tại`);
    }
    return promotion;
  }
  async update(
    id: string,
    updatePromotionDto: CreatePromotionDto,
  ): Promise<MessageResponse> {
    const promotion = await this.promotionRepository.findOne({ where: { id } });
    if (!promotion) {
      throw new NotFoundException(`Khuyến mãi với ID ${id} không tồn tại`);
    }

    if (updatePromotionDto.code) {
      const existingPromotion = await this.promotionRepository.findOne({
        where: { code: updatePromotionDto.code, id: Not(id) },
      });
      if (existingPromotion) {
        throw new ConflictException(
          `Mã khuyến mãi ${updatePromotionDto.code} đã tồn tại`,
        );
      }
    }

    Object.assign(promotion, updatePromotionDto);
    const updatedPromotion = await this.promotionRepository.save(promotion);

    return {
      statusCode: HttpStatus.OK,
      message: 'Khuyến mãi đã được cập nhật thành công',
    };
  }
  async remove(id: string): Promise<void> {
    const result = await this.promotionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Khuyến mãi với ID ${id} không tồn tại`);
    }
  }
}
