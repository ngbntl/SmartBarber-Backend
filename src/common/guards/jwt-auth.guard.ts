import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { MESSAGE } from '../constants/message';
import { TokenService } from 'src/modules/tokens/token.service';
import { UsersService } from 'src/modules/users/users.service';
import { RoleType } from '../constants/enum';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private tokenService: TokenService,
    private usersService: UsersService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);

      if (!token) {
        throw new UnauthorizedException(MESSAGE.INVALID_OR_EXPIRED_TOKEN);
      }
      const payload = await this.tokenService.validateToken(token);

      if (!payload) {
        throw new UnauthorizedException(MESSAGE.INVALID_OR_EXPIRED_TOKEN);
      }
      const user = await this.usersService.findById(payload.userId);

      if (!user) {
        throw new UnauthorizedException(MESSAGE.INVALID_OR_EXPIRED_TOKEN);
      }

      request['userLogged'] = user;

      const roles: string[] | string = this.reflector.get(
        'roles',
        context.getHandler(),
      );

      if (roles) {
        const userRole = user.roleType;
        const hasRequiredRole = Array.isArray(roles)
          ? roles.some((role) => userRole === role)
          : userRole === roles;

        if (!hasRequiredRole) {
          throw new ForbiddenException(MESSAGE.FORBIDDEN);
        }
      }
    } catch (error) {
      throw error;
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
