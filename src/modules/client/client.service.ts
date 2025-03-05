import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientsEntity } from 'src/database/entities/clients.entity';
import { Repository } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { MESSAGE } from 'src/common/constants/message';
import { generateCustomString } from 'src/utils/function';
import { MessageResponse } from 'src/common/types/response';
import { ClientQuery } from './dto/client.query.dto';
import { Client, Clients } from './types/client.types';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(ClientsEntity)
    private readonly clientRes: Repository<ClientsEntity>,
  ) {}

  async getByClientId(clientId: string): Promise<ClientsEntity> {
    return await this.clientRes.findOne({ where: { clientId } });
  }

  async getAll(query: ClientQuery): Promise<Clients> {
    try {
      let conditions = '';
      const parameters: any = {};

      if (query.filter?.trim().length > 0) {
        conditions += conditions ? ' AND ' : '';
        conditions +=
          'client.Name LIKE :filter OR client.RedirectUrl LIKE :filter';
        parameters.filter = `%${query.filter.trim()}%`;
      }

      const queryResult = this.clientRes
        .createQueryBuilder('client')
        .where(conditions, parameters)
        .orderBy('client.CreateAt', 'DESC')
        .addSelect('client.Id', 'id')
        .addSelect('client.Name', 'name')
        .addSelect('client.ClientId', 'clientId')
        .addSelect('client.ClientSecret', 'clientSecret')
        .addSelect('client.RedirectUrl', 'redirectUrl')
        .addSelect('client.Scope', 'scope')
        .addSelect('client.CreateAt', 'createAt');

      let data = queryResult
        .offset((query.currentPage - 1) * query.perPage)
        .limit(query.perPage);

      const [rawItems, total] = await Promise.all([
        data.getRawMany(),
        data.getCount(),
      ]);

      const items = plainToClass(Client, rawItems, {
        excludeExtraneousValues: true,
      });

      return {
        total,
        items,
      };
    } catch (error) {
      throw error;
    }
  }

  async createOne(body: CreateClientDto): Promise<MessageResponse> {
    try {
      const url = body.redirectUrl.endsWith('/')
        ? body.redirectUrl.slice(0, -1)
        : body.redirectUrl;
      const client = {
        name: body.name,
        clientId: `${generateCustomString(
          50,
        )}-${body.name.toLowerCase()}.apps.inweb.com`,
        clientSecret: generateCustomString(100),
        redirectUrl: url,
        createAt: new Date().getTime(),
      };

      await this.clientRes.save(client);
      return {
        statusCode: HttpStatus.OK,
        message: MESSAGE.CREATE_CLIENT_SUCCESS,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateClient(body: UpdateClientDto): Promise<MessageResponse> {
    try {
      const client = await this.clientRes.findOne({ where: { id: body.id } });
      client.name = body.name ?? client.name;
      client.redirectUrl = body.redirectUrl ?? client.redirectUrl;
      client.updateAt = new Date().getTime();

      await this.clientRes.save(client);

      return {
        statusCode: HttpStatus.OK,
        message: MESSAGE.UPDATE_CLIENT_SUCCESS,
      };
    } catch (error) {
      throw error;
    }
  }

  async delete(id: number): Promise<MessageResponse> {
    try {
      await this.clientRes.delete({ id });
      return {
        statusCode: HttpStatus.OK,
        message: MESSAGE.DELETE_CLIENT_SUCCESS,
      };
    } catch (error) {
      throw error;
    }
  }
}
