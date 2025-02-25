import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { DEFAULT_LOCALE } from '../../configs';
import { BaseResponseDto } from '../base/base.dto';
import { I18nService } from '../shared/i18n.service';

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, BaseResponseDto<T>>
{
  constructor(private i18n: I18nService) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<BaseResponseDto<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const lang =
      request?.headers['accept-language']?.split(';')[0]?.split(',')[0] ||
      DEFAULT_LOCALE;
    return next.handle().pipe(
      map((response: BaseResponseDto<T>) => {
        if (response.message) {
          return {
            ...response,
            message: this.i18n.lang(response.message, lang),
          };
        }
        return response;
      }),
    );
  }
}
