import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from 'src/database/entities/users.entity';
import { DeepPartial, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRes: Repository<UsersEntity>,
  ) {}

  async findByEmail(email: string): Promise<UsersEntity> {
    return await this.userRes.findOne({ where: { email } });
  }

  async updateUsers(users: DeepPartial<UsersEntity>[]): Promise<void> {
    await this.userRes.save(users);
  }

  async findById(id: string): Promise<UsersEntity> {
    const user = await this.userRes.findOne({
      where: { id },
    });
    return user;
  }

  async save(user: DeepPartial<UsersEntity>): Promise<UsersEntity> {
    return await this.userRes.save(user);
  }
}
