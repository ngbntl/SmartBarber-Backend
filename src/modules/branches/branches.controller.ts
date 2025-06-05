import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuth } from '../../common/decorators/jwt-auth.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { MessageResponse } from 'src/common/types/response';
import { Branches, BranchesResponse } from './types/branches.types';
import { RoleType } from 'src/common/constants/enum';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('branches')
@ApiBearerAuth()
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @JwtAuth()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Tạo chi nhánh mới' })
  create(@Body() createBranchDto: CreateBranchDto): Promise<MessageResponse> {
    return this.branchesService.create(createBranchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả chi nhánh' })
  findAll(): Promise<Branches> {
    return this.branchesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi nhánh theo ID' })
  findOne(@Param('id') id: string): Promise<BranchesResponse> {
    return this.branchesService.findOne(id);
  }

  @Put(':id')
  @JwtAuth()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Cập nhật chi nhánh theo ID' })
  update(
    @Param('id') id: string,
    @Body() updateBranchDto: CreateBranchDto,
  ): Promise<MessageResponse> {
    return this.branchesService.update(id, updateBranchDto);
  }

  @Post(':id/upload-image')
  @JwtAuth()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Upload ảnh cho chi nhánh' })
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
  uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MessageResponse> {
    return this.branchesService.uploadImage(id, file);
  }

  @Delete(':id/delete-image')
  @JwtAuth()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Xóa ảnh của chi nhánh' })
  deleteImage(@Param('id') id: string): Promise<MessageResponse> {
    return this.branchesService.deleteImage(id);
  }
}
