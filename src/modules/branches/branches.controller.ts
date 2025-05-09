import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuth } from '../../common/decorators/jwt-auth.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { MessageResponse } from 'src/common/types/response';
import { Branches } from './types/branches.types';
import { RoleType } from 'src/common/constants/enum';

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
}
