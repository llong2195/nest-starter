import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { LoggerService } from '@src/logger/custom.logger';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context?.switchToHttp()?.getRequest();
        const response = context?.switchToHttp()?.getResponse();
        const now = Date.now();
        return next.handle().pipe(
            tap(() => {
                LoggerService.log(
                    `{${request?.route?.path}, ${request?.method}} - ${response?.statusCode} : ${Date.now() - now} ms`,
                );
            }),
        );
    }
}
