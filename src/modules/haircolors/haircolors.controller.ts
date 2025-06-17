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
import { HaircolorsService } from './haircolors.service';
import {
  CreateHaircolorDto,
  UpdateHaircolorDto,
  QueryHaircolorDto,
} from './dto/haircolor.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuth } from 'src/common/decorators/jwt-auth.decorator';
import { RoleType } from 'src/common/constants/enum';

@ApiTags('haircolors')
@ApiBearerAuth()
@Controller('haircolors')
export class HaircolorsController {
  constructor(private readonly haircolorsService: HaircolorsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách màu tóc' })
  findAll(@Query() query: QueryHaircolorDto) {
    return this.haircolorsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một màu tóc' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.haircolorsService.findOne(id);
  }

  @Post()
  @JwtAuth()
  @Roles(RoleType.ADMIN)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Tạo mới màu tóc' })
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
    @Body() createHaircolorDto: CreateHaircolorDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.haircolorsService.create(createHaircolorDto, file);
  }

  @Patch(':id')
  @JwtAuth()
  @Roles(RoleType.ADMIN)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Cập nhật màu tóc' })
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
    @Body() updateHaircolorDto: UpdateHaircolorDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.haircolorsService.update(id, updateHaircolorDto, file);
  }

  @Delete(':id')
  @JwtAuth()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Xóa màu tóc' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.haircolorsService.remove(id);
  }
}
