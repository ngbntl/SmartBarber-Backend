import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { plainToClass } from 'class-transformer';
import { UserResponse } from './types/user.types';
import { JwtAuth } from 'src/common/decorators/jwt-auth.decorator';
import { UserQuery } from './dto/user.query.dto';
import { Role } from 'src/common/constants/enum';
import { Roles } from 'src/common/decorators/roles.decorator';
// import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
@JwtAuth()
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('me')
  async getMyself(@Req() req: any): Promise<UserResponse> {
    const { userLogged } = req;
    const userData = plainToClass(UserResponse, userLogged, {
      excludeExtraneousValues: true,
    });
    return userData;
  }
}
