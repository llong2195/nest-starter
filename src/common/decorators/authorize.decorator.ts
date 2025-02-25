import { applyDecorators, UseGuards } from '@nestjs/common';

import { RoleEnum } from '../enums';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { RolesGuard } from '../guard/role.guard';
import { Roles } from './role.decorators';

export const Authorize = (...roles: RoleEnum[]) => {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    UseGuards(RolesGuard),
    Roles(...roles),
  );
};
