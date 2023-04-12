import { Request, Response } from 'express';
import { LoggerService } from 'src/logger/custom.logger';
import { QueryFailedError } from 'typeorm';

import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces/features/arguments-host.interface';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import '@sentry/tracing';

import { ErrorCode } from '@constants/error-code';
import { BaseError } from '@exceptions/errors';
import { SENTRY_DSN } from '@src/configs';
import { I18nService } from '@src/i18n/i18n.service';
import { IResponseBody } from '@src/interface';
import { isDev } from '@utils/util';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
    constructor(private logger: LoggerService, private readonly configService: ConfigService) {
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
        const i18nService = new I18nService(request);
        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let errorCode = ErrorCode.UNKNOWN;
        let message = 'Internal server error';
        let responseBody: IResponseBody = {
            statusCode: statusCode,
            errorCode: errorCode,
            message: message,
        };
        if (exception instanceof BaseError) {
            statusCode = exception.getStatus();
            errorCode = exception.getErrorCode();
            message =
                typeof exception.getResponse() == 'string'
                    ? exception.getResponse()
                    : JSON.parse(JSON.stringify(exception.getResponse()))?.message;
            responseBody = {
                statusCode: statusCode,
                errorCode: errorCode,
                message: message,
            };
        } else if (exception instanceof HttpException) {
            const responseException = exception.getResponse();
            statusCode = exception.getStatus();
            errorCode = ((responseException as Record<string, unknown>)?.errorCode as number) || ErrorCode.UNKNOWN;
            message =
                typeof exception.getResponse() == 'string'
                    ? exception.getResponse()
                    : JSON.parse(JSON.stringify(exception.getResponse()))?.message;
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

        if (Array.isArray(responseBody.message)) {
            responseBody.message = responseBody.message[0];
        }
        if (responseBody.message) responseBody.message = i18nService.t(responseBody.message as string);
        response.status(statusCode).send(responseBody);
        this.handleMessage(exception, request, responseBody);
    }

    catch(exception: HttpException | Error | BaseError, host: ArgumentsHost): void {
        const ctx: HttpArgumentsHost = host.switchToHttp();
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
            message = exception.stack.toString();
        } else if (exception instanceof Error) {
            message = exception.stack.toString();
            if (message.includes('no such file or directory')) {
                message = 'Not Found';
            }
        }
        this.logger.error(message, exception.stack, exception.name);

        const { body, headers, ip, method, params, query } = request;
        const user = (request as unknown as Record<string, string>)?.user;
        Sentry.setTag('ip', JSON.stringify(request.headers['X-FORWARDED-FOR']) + ',' + request.ip);
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
