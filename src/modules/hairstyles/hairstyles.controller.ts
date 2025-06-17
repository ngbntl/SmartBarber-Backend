import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiConsumes,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { HairstylesService } from './hairstyles.service';
import {
  CreateHairstyleDto,
  UpdateHairstyleDto,
  QueryHairstyleDto,
} from './dto/hairstyle.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuth } from 'src/common/decorators/jwt-auth.decorator';
import { RoleType } from 'src/common/constants/enum';

@ApiTags('hairstyles')
@ApiBearerAuth()
@Controller('hairstyles')
export class HairstylesController {
  constructor(private readonly hairstylesService: HairstylesService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách kiểu tóc' })
  findAll(@Query() query: QueryHairstyleDto) {
    return this.hairstylesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một kiểu tóc' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.hairstylesService.findOne(id);
  }

  @Post()
  @JwtAuth()
  @Roles(RoleType.ADMIN)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Tạo mới kiểu tóc' })
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
          return callback(new Error('Chỉ chấp nhận file ảnh!'), false);
        }
        callback(null, true);
      },
    }),
  )
  create(
    @Body() createHairstyleDto: CreateHairstyleDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.hairstylesService.create(createHairstyleDto, file);
  }

  @Patch(':id')
  @JwtAuth()
  @Roles(RoleType.ADMIN)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Cập nhật kiểu tóc' })
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
          return callback(new Error('Chỉ chấp nhận file ảnh!'), false);
        }
        callback(null, true);
      },
    }),
  )
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateHairstyleDto: UpdateHairstyleDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.hairstylesService.update(id, updateHairstyleDto, file);
  }

  @Delete(':id')
  @JwtAuth()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Xóa kiểu tóc' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.hairstylesService.remove(id);
  }
}
