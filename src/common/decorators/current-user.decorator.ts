import { Request } from 'express';

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface RequestWithUser extends Request {
  user?: any; // Define the type of user here
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request?.user as unknown;
  },
);
