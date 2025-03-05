import {
  Controller,
  Post,
  Param,
  Body,
  Put,
  Delete,
  Get,
  Query,
} from '@nestjs/common';
import { ClientService } from './client.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { MessageResponse } from 'src/common/types/response';
import { ClientQuery } from './dto/client.query.dto';
import { Clients } from './types/client.types';
import { JwtAuth } from 'src/common/decorators/jwt-auth.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/constants/enum';

@ApiBearerAuth()
@ApiTags('Client')
@Controller('client')
@JwtAuth()
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get()
  @Roles([Role.Admin])
  async getAll(@Query() request: ClientQuery): Promise<Clients> {
    return await this.clientService.getAll(request);
  }

  @Post()
  @Roles([Role.Admin])
  async createClient(
    @Body() request: CreateClientDto,
  ): Promise<MessageResponse> {
    return await this.clientService.createOne(request);
  }

  @Put()
  @Roles([Role.Admin])
  async updateClient(
    @Body() request: UpdateClientDto,
  ): Promise<MessageResponse> {
    return await this.clientService.updateClient(request);
  }

  @Delete('/:id')
  @Roles([Role.Admin])
  async delete(@Param('id') id: number): Promise<MessageResponse> {
    return await this.clientService.delete(id);
  }
}
