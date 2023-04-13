import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseResponseDto } from '@base/base.dto';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { MessageService } from '@src/i18n/message.service';
import { DEFAULT_LOCALE } from '@configs/config';

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, BaseResponseDto<T>> {
    constructor(private i18n: MessageService) {}
    intercept(context: ExecutionContext, next: CallHandler): Observable<BaseResponseDto<T>> {
        const request = context.switchToHttp().getRequest<Request>();
        const lang = request.acceptsLanguages()[0] || DEFAULT_LOCALE;
        return next.handle().pipe(
            map(response => {
                if (response?.message) {
                    return { ...response, message: this.i18n.lang(response?.message, lang) };
                }
                return response;
            }),
        );
    }
}
