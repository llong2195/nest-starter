import { RoleEnum } from '@enums/role.enum';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { applyDecorators, UseGuards } from '@nestjs/common';
import { RolesGuard } from '@src/guard/role.guard';

import { Roles } from './role.decorators';

export const Authorize = (...roles: RoleEnum[]) => {
    return applyDecorators(UseGuards(JwtAuthGuard), UseGuards(RolesGuard), Roles(...roles));
};
