import { Request } from 'express';

import { DEFAULT_LOCALE } from '@/configs/config';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const HeaderUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const headerData = {
      lang:
        request.acceptsLanguages()?.[0] ||
        request?.headers['accept-language']?.split(';')[0]?.split(',')[0] ||
        DEFAULT_LOCALE,
    };
    return headerData;
  },
);
