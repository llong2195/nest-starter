import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Creating a decorator that can be used to get the user from the request.
 */
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
});
