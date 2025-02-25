import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

import { DEFAULT_LOCALE, SENTRY_DSN } from '@/configs';
import { isDev } from '@/utils';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';

import { ErrorCode } from '../constants';
import { BaseError } from '../exceptions/errors';
import { IResponseBody } from '../interface';
import { LoggerService } from '../logger/custom.logger';
import { I18nService } from '../shared/i18n.service';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(
    private logger: LoggerService,
    private readonly configService: ConfigService,
    private readonly i18nService: I18nService,
  ) {
    Sentry.init({
      dsn: SENTRY_DSN,
      normalizeDepth: 10,
      tracesSampleRate: 1.0,
    });
  }

  private handleResponse(
    request: Request,
    response: Response,
    exception: HttpException | QueryFailedError | Error,
  ): void {
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = ErrorCode.UNKNOWN;
    let message = 'Internal server error';
    const lang =
      request?.headers['accept-language']?.split(';')[0]?.split(',')[0] ||
      DEFAULT_LOCALE;
    let responseBody: IResponseBody = {
      statusCode: statusCode,
      errorCode: errorCode,
      message: message,
    };

    if (exception instanceof BaseError) {
      statusCode = exception.getStatus();
      errorCode = exception.getErrorCode();
      const response = exception.getResponse();
      message =
        typeof response == 'string'
          ? response
          : (response as { message?: string })?.message || '';
      responseBody = {
        statusCode: statusCode,
        errorCode: errorCode,
        message: message,
      };
    } else if (exception instanceof HttpException) {
      const responseException = exception.getResponse();
      statusCode = exception.getStatus();
      errorCode =
        ((responseException as Record<string, unknown>)?.errorCode as number) ||
        ErrorCode.UNKNOWN;

      const response = exception.getResponse();
      message =
        typeof response == 'string'
          ? response
          : JSON.stringify(exception.getResponse() as object);
      responseBody = {
        statusCode: statusCode,
        errorCode: errorCode,
        message: message,
      };
    } else if (exception instanceof QueryFailedError) {
      statusCode = HttpStatus.BAD_REQUEST;
      errorCode = ErrorCode.DATABASE_ERROR;
      message = isDev() ? exception.message : 'Query database error.';
      responseBody = {
        statusCode: statusCode,
        errorCode: errorCode,
        message: message,
      };
    } else if (exception instanceof Error) {
      statusCode = HttpStatus.BAD_REQUEST;
      errorCode = ErrorCode.UNKNOWN;
      message = exception.message;
      responseBody = {
        statusCode: statusCode,
        errorCode: errorCode,
        message: message,
      };
    }

    if (responseBody.message) {
      responseBody.message = this.i18nService.lang(responseBody.message, lang);
    }
    this.handleMessage(exception, request, responseBody);
    response.status(statusCode).send(responseBody);
  }

  catch(
    exception: HttpException | Error | BaseError,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    // Handling error message and logging

    // Response to client
    this.handleResponse(request, response, exception);
  }

  private handleMessage(
    exception: HttpException | QueryFailedError | Error,
    request: Request,
    responseBody: IResponseBody,
  ): void {
    let message = 'Internal Server Error';

    if (exception instanceof HttpException || exception instanceof BaseError) {
      message = JSON.stringify(exception.getResponse());
    } else if (exception instanceof QueryFailedError) {
      message = exception?.stack?.toString() || '';
    } else if (exception instanceof Error) {
      message = exception?.stack?.toString() || '';
      if (message.includes('no such file or directory')) {
        message = 'Not Found';
      }
    }
    this.logger.error(message, exception.stack, exception.name);

    const { body, headers, ip, method, params, query } = request;
    const user = (request as unknown as Record<string, string>)?.user;
    Sentry.setTag(
      'ip',
      JSON.stringify(request.headers['X-FORWARDED-FOR']) + ',' + request.ip,
    );
    Sentry.setTag('queryquery', JSON.stringify(request.query));
    Sentry.setTag('method', request.method);

    Sentry.setExtra('body', request.body);
    Sentry.setExtra('user', user);

    Sentry.setTag('userAgent', request.headers['user-agent']);
    Sentry.setTag('logLevel', this.configService.get<string>('LOG_LEVEL'));
    Sentry.setTag('nodeEnv', this.configService.get<string>('NODE_ENV'));

    const url: string = request.headers['x-envoy-original-path']
      ? (request.headers['x-envoy-original-path'] as string)
      : request.url;
    Sentry.setTag('url', `${request.hostname}${url}`);

    Sentry.setTag('statusCode', responseBody.statusCode);
    Sentry.setTag('errorCode', responseBody.errorCode);
    Sentry.setTag('message', JSON.stringify(responseBody.message));
    Sentry.setExtras({
      authorization: headers.authorization,
      body,
      ip,
      method,
      params,
      query,
      url: headers.origin + url,
      user,
    });
    Sentry.captureException(exception);
  }
}
