import { isString } from 'class-validator';
import { QueryFailedError } from 'typeorm';

import { isProd } from '@/utils';
import { BadRequestException, HttpException } from '@nestjs/common';

import { ErrorCode, ErrorMessageCode } from '../constants';
import { BaseError, DatabaseError, ValidateError } from '../exceptions/errors';
import { I18nService } from '../shared/i18n.service';

export class BaseController {
  protected i18n: I18nService;

  constructor(i18n: I18nService) {
    this.i18n = i18n;
  }

  /***
   *
   * @param error
   * @param lang
   */
  protected throwErrorProcess(error: unknown, lang?: string): void {
    if (error instanceof BaseError) {
      throw new BadRequestException({
        message: this.i18n.lang(error.getMessage(), lang),
        errorCode: error.getErrorCode(),
      });
    } else if (error instanceof TypeError) {
      // console.error(error)
      throw new ValidateError(
        this.i18n.lang(ErrorMessageCode.SYNTAX_ERROR, lang),
        ErrorCode.SYNTAX_ERROR,
      );
    } else if (error instanceof QueryFailedError) {
      // console.error(error)
      throw new DatabaseError(
        this.i18n.lang(ErrorMessageCode.UNKNOWN, lang),
        ErrorCode.UNKNOWN,
      );
    } else if (error instanceof HttpException) {
      const response = error.getResponse() as Record<string, unknown>;
      if (isString(response)) {
        throw new BadRequestException({
          message: this.i18n.lang(
            (response.message as string) || 'Unknown error',
          ),
          errorCode: (response.errorCode as number) || ErrorCode.UNKNOWN,
        });
      }

      throw new BadRequestException({
        message: this.i18n.lang(
          (response.message as string) || 'Unknown error',
        ),
        errorCode: (response.errorCode as number) || ErrorCode.UNKNOWN,
      });
    }

    let msg = this.i18n.lang('DATABASE_ERROR', lang);
    if (error instanceof Error) {
      msg = this.i18n.lang(error.message, lang);
    }

    throw new DatabaseError(
      isProd() ? this.i18n.lang('DATABASE_ERROR', lang) : msg,
      ErrorCode.DATABASE_ERROR,
      error as Error,
    );
  }
}
