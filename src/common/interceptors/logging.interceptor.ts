import { Response, Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { LoggerService } from '@/common/logger/custom.logger';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context?.switchToHttp()?.getRequest<Request>();
    const response = context?.switchToHttp()?.getResponse<Response>();
    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        LoggerService.log(
          `{${request?.url}, ${request?.method}} - ${response?.statusCode} : ${Date.now() - now} ms`,
        );
      }),
    );
  }
}
