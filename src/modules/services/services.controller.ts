import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MessageResponse } from 'src/common/types/response';
import { FileInterceptor } from '@nestjs/platform-express';

import { Services, ServicesResponse } from './types/services.types';
import { RoleType } from 'src/common/constants/enum';
import { JwtAuth } from 'src/common/decorators/jwt-auth.decorator';

@ApiTags('services')
@ApiBearerAuth()
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @JwtAuth()
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  async createService(
    @Body() createServiceDto: CreateServiceDto,
  ): Promise<MessageResponse> {
    return this.servicesService.createService(createServiceDto);
  }

  @Post('with-image')
  @JwtAuth()
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        duration: { type: 'number' },
        isActive: { type: 'boolean' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async createServiceWithImage(
    @Body() createServiceDto: CreateServiceDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<MessageResponse> {
    return this.servicesService.createServiceWithImage(createServiceDto, file);
  }

  @Post('upload-image/:id')
  @JwtAuth()
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadServiceImage(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<MessageResponse> {
    return this.servicesService.uploadServiceImage(id, file);
  }

  @Get()
  async getAllServices(): Promise<Services> {
    return this.servicesService.getAllServices();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID' })
  async getServiceById(@Param('id') id: string): Promise<ServicesResponse> {
    return this.servicesService.getServiceById(id);
  }

  @Get('with-booking-count')
  async getServicesWithBookingCount(): Promise<Services> {
    return this.servicesService.getAllServices();
  }

  @Put(':id')
  @JwtAuth()
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  async updateService(
    @Param('id') id: string,
    @Body() updateServiceDto: CreateServiceDto,
  ): Promise<MessageResponse> {
    return this.servicesService.updateService(id, updateServiceDto);
  }

  @Delete(':id')
  @JwtAuth()
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth()
  async deleteService(@Param('id') id: string): Promise<MessageResponse> {
    return this.servicesService.deleteService(id);
  }
}
