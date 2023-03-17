import '@sentry/tracing';

import { Request, Response } from 'express';
import { LoggerService } from 'src/logger/custom.logger';
import { QueryFailedError } from 'typeorm';

import { BaseError } from '@exceptions/errors';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces/features/arguments-host.interface';
import * as Sentry from '@sentry/node';
import { SENTRY_DSN } from '@src/configs';
import { I18nService } from '@src/i18n/i18n.service';
import { IResponseBody } from '@src/interface';

import { ErrorCode } from '../constants/error-code';
import { isDev } from '../utils/util';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
    constructor(private logger: LoggerService) {
        Sentry.init({
            dsn: SENTRY_DSN,
            normalizeDepth: 10,
            tracesSampleRate: 1.0,
        });
    }

    private static handleResponse(
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
                    : JSON.parse(JSON.stringify(exception.getResponse())).message;
            responseBody = {
                statusCode: statusCode,
                errorCode: errorCode,
                message: message,
            };
        } else if (exception instanceof HttpException) {
            const responseException = exception.getResponse();
            statusCode = exception.getStatus();
            errorCode = ((responseException as Record<string, unknown>).errorCode as number) || ErrorCode.UNKNOWN;
            message =
                typeof exception.getResponse() == 'string'
                    ? exception.getResponse()
                    : JSON.parse(JSON.stringify(exception.getResponse())).message;
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
        if (responseBody.message) responseBody.message = i18nService.t(message);
        response.status(statusCode).json(responseBody);
    }

    catch(exception: HttpException | Error | BaseError, host: ArgumentsHost): void {
        const ctx: HttpArgumentsHost = host.switchToHttp();
        const response: Response = ctx.getResponse();
        const request: Request = ctx.getRequest();
        this.logger.error(exception.message, exception.stack, exception.name);
        // Handling error message and logging
        // this.handleMessage(exception);

        // Response to client
        AllExceptionFilter.handleResponse(request, response, exception);

        const { body, headers, ip, method, originalUrl, params, query, user } = request;
        Sentry.setExtras({
            authorization: headers.authorization,
            body,
            ip,
            method,
            params,
            query,
            url: headers.origin + originalUrl,
            user,
        });
        Sentry.captureException(exception);
    }

    private handleMessage(exception: HttpException | QueryFailedError | Error): void {
        let message = 'Internal Server Error';

        if (exception instanceof HttpException) {
            message = JSON.stringify(exception.getResponse());
        } else if (exception instanceof QueryFailedError) {
            message = exception.stack.toString();
        } else if (exception instanceof Error) {
            message = exception.stack.toString();
            if (message.includes('no such file or directory')) {
                message = 'Not Found';
            }
        }
    }
}
