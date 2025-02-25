import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY, RequestWithUser, ROLES_KEY } from '../decorators';
import { RoleEnum } from '../enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (
      !requiredRoles ||
      requiredRoles.length < 1 ||
      requiredRoles.includes(RoleEnum.ALL)
    ) {
      return true;
    }
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const user = req.user as { role?: RoleEnum[] } | undefined;
    if (!user) {
      return false;
    }
    return requiredRoles.some((role) => user?.role?.includes(role));
  }
}
