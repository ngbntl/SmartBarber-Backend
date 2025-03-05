import { SetMetadata } from '@nestjs/common';

export const Roles = (roles: string | string[]) => SetMetadata('roles', roles);
